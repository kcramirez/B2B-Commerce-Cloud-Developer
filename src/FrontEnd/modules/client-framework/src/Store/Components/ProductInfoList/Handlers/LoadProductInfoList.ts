import { createFromProduct, ProductInfo } from "@insite/client-framework/Common/ProductInfo";
import waitFor from "@insite/client-framework/Common/Utilities/waitFor";
import {
    createHandlerChainRunner,
    executeAwaitableHandlerChain,
    Handler,
} from "@insite/client-framework/HandlerCreator";
import {
    GetProductCollectionApiV2Parameter,
    GetRelatedProductCollectionApiV2Parameter,
} from "@insite/client-framework/Services/ProductServiceV2";
import loadRealTimeInventory from "@insite/client-framework/Store/CommonHandlers/LoadRealTimeInventory";
import loadRealTimePricing from "@insite/client-framework/Store/CommonHandlers/LoadRealTimePricing";
import { getSettingsCollection } from "@insite/client-framework/Store/Context/ContextSelectors";
import loadProducts from "@insite/client-framework/Store/Data/Products/Handlers/LoadProducts";
import { getProductsDataView } from "@insite/client-framework/Store/Data/Products/ProductsSelectors";
import { ProductModel } from "@insite/client-framework/Types/ApiModels";

interface Parameter {
    id: string;
    getProductCollectionParameter: GetProductCollectionApiV2Parameter | GetRelatedProductCollectionApiV2Parameter;
    extraProductOptions?: {
        getProductCollectionParameter: GetProductCollectionApiV2Parameter | GetRelatedProductCollectionApiV2Parameter;
        numberOfProductsToDisplay: number;
    };
}

interface Props {
    products?: ProductModel[];
    productInfos?: ProductInfo[];
    pricingLoaded?: true;
}

type HandlerType = Handler<Parameter, Props>;

export const LoadProducts: HandlerType = async props => {
    const parameter = props.parameter.getProductCollectionParameter;
    if (!parameter) {
        return false;
    }

    props.products = getProductsDataView(props.getState(), parameter).value;

    if (props.products) {
        return;
    }

    props.products = await executeAwaitableHandlerChain(loadProducts, parameter, props);
};

export const LoadExtraProducts: HandlerType = async props => {
    const {
        parameter: { extraProductOptions },
    } = props;
    if (!extraProductOptions) {
        return;
    }

    if (props.products && props.products.length >= extraProductOptions.numberOfProductsToDisplay) {
        return;
    }

    let extraProducts = getProductsDataView(props.getState(), extraProductOptions.getProductCollectionParameter).value;

    if (!extraProducts) {
        extraProducts = await executeAwaitableHandlerChain(
            loadProducts,
            extraProductOptions.getProductCollectionParameter,
            props,
        );
    }

    extraProducts?.forEach(extraProduct => {
        if (
            props.products!.length < extraProductOptions.numberOfProductsToDisplay &&
            props.products!.every(existingProduct => existingProduct.id !== extraProduct.id)
        ) {
            props.products!.push(extraProduct);
        }
    });
};

export const SetUpProductInfos: HandlerType = props => {
    if (!props.products) {
        return;
    }

    props.productInfos = [];
    for (const product of props.products) {
        props.productInfos.push(createFromProduct(product));
    }
};

export const DispatchCompleteLoadPurchasedProducts: HandlerType = props => {
    props.dispatch({
        type: "Components/ProductInfoLists/CompleteLoadProductInfoList",
        id: props.parameter.id,
        productInfos: props.productInfos ?? [],
    });
};

export const LoadRealTimePrices: HandlerType = async props => {
    if (!props.productInfos || props.productInfos.length === 0) {
        return;
    }

    props.dispatch(
        loadRealTimePricing({
            productPriceParameters: props.productInfos,
            onSuccess: realTimePricing => {
                props.dispatch({
                    type: "Components/ProductInfoLists/CompleteLoadRealTimePricing",
                    id: props.parameter.id,
                    realTimePricing,
                });
                props.pricingLoaded = true;
            },
            onError: () => {
                props.dispatch({
                    type: "Components/ProductInfoLists/FailedLoadRealTimePricing",
                    id: props.parameter.id,
                });
                props.pricingLoaded = true;
            },
        }),
    );

    if (getSettingsCollection(props.getState()).productSettings.inventoryIncludedWithPricing) {
        await waitFor(() => !!props.pricingLoaded);
    }
};

export const LoadRealTimeInventory: HandlerType = props => {
    if (!props.productInfos || props.productInfos.length === 0) {
        return;
    }

    props.dispatch(
        loadRealTimeInventory({
            productIds: props.productInfos.map(o => o.productId),
            onSuccess: realTimeInventory => {
                props.dispatch({
                    type: "Components/ProductInfoLists/CompleteLoadRealTimeInventory",
                    id: props.parameter.id,
                    realTimeInventory,
                });
            },
        }),
    );
};

export const chain = [
    LoadProducts,
    LoadExtraProducts,
    SetUpProductInfos,
    DispatchCompleteLoadPurchasedProducts,
    LoadRealTimePrices,
    LoadRealTimeInventory,
];

const loadProductInfoList = createHandlerChainRunner(chain, "LoadProductInfoList");
export default loadProductInfoList;