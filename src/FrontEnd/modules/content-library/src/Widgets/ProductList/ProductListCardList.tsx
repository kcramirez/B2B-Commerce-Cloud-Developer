import React, { FC } from "react";
import { connect } from "react-redux";
import WidgetModule from "@insite/client-framework/Types/WidgetModule";
import WidgetProps from "@insite/client-framework/Types/WidgetProps";
import { ProductListPageContext, ProductListPageDataContext } from "@insite/content-library/Pages/ProductListPage";
import ApplicationState from "@insite/client-framework/Store/ApplicationState";
import StyledWrapper from "@insite/client-framework/Common/StyledWrapper";
import InjectableCss from "@insite/mobius/utilities/InjectableCss";
import CardList, { CardListStyles } from "@insite/content-library/Components/CardList";
import CardContainer, { CardContainerStyles } from "@insite/content-library/Components/CardContainer";
import Typography, { TypographyPresentationProps } from "@insite/mobius/Typography";
import translate from "@insite/client-framework/Translate";
import { ProductContext } from "@insite/client-framework/Components/ProductContext";
import ProductListProductCard from "@insite/content-library/Widgets/ProductList/ProductListProductCard";
import LoadingSpinner, { LoadingSpinnerProps } from "@insite/mobius/LoadingSpinner";
import { css } from "styled-components";
import ProductListProductGridCard from "@insite/content-library/Widgets/ProductList/ProductListProductGridCard";
import CardContainerMultiColumn, { CardContainerMultiColumnStyles } from "@insite/content-library/Components/CardContainerMultiColumn";
import Hidden from "@insite/mobius/Hidden";
import getColor from "@insite/mobius/utilities/getColor";
import LoadingOverlay from "@insite/mobius/LoadingOverlay";
import { getSettingsCollection } from "@insite/client-framework/Store/Context/ContextSelectors";

const enum fields {
    showImage = "showImage",
    showCompare = "showCompare",
    showBrand = "showBrand",
    showTitle = "showTitle",
    showPartNumbers = "showPartNumbers",
    showAvailability = "showAvailability",
    showAttributes = "showAttributes",
    showPrice = "showPrice",
    showAddToList = "showAddToList",
}

interface OwnProps extends WidgetProps {
    fields: {
        [fields.showImage]: boolean;
        [fields.showCompare]: boolean;
        [fields.showTitle]: boolean;
        [fields.showBrand]: boolean;
        [fields.showPartNumbers]: boolean;
        [fields.showAvailability]: boolean;
        [fields.showAttributes]: boolean;
        [fields.showPrice]: boolean;
        [fields.showAddToList]: boolean;
    };
}

interface OwnProps extends WidgetProps {
}

const mapStateToProps = (state: ApplicationState) => ({
    productsState: state.pages.productList.productsState,
    view: state.pages.productList.view || getSettingsCollection(state).productSettings.defaultViewType,
});

type Props =  ReturnType<typeof mapStateToProps> & OwnProps;

export interface ProductListCardListStyles {
    wrapper?: InjectableCss;
    cardList?: CardListStyles;
    noProductsText?: TypographyPresentationProps;
    centeringWrapper?: InjectableCss;
    spinner?: LoadingSpinnerProps;
    cardContainerStyles?: CardContainerStyles;
    cardContainerMultiColumnStyles?: CardContainerMultiColumnStyles;
}

const styles: ProductListCardListStyles = {
    wrapper: {
        css: css`
            margin-top: 20px;
            border-top: 1px solid ${getColor("common.border")};
        `,
    },
    cardList: {
        gridContainer: {
            gap: 0,
        },
    },
    centeringWrapper: {
        css: css`
            width: 100%;
            height: 300px;
            display: flex;
            align-items: center;
        `,
    },
    spinner: {
        css: css` margin: auto; `,
    },
    noProductsText: {
        variant: "h4",
        css: css`
            display: block;
            margin: auto;
        `,
    },
    cardContainerStyles: {
        cardDivider: {
            css: css` width: 100%; `,
        },
        gridItem: {
            css: css` border-bottom: 1px solid ${getColor("common.border")}; `,
        },
    },
};

export const listStyles = styles;

const ProductListCardList: FC<Props> = ({ productsState, view, fields }) => {
    if (productsState.isLoading && !productsState.value) {
        return <StyledWrapper {...styles.centeringWrapper}>
            <LoadingSpinner {...styles.spinner} data-test-selector="productListCardListSpinner"/>
        </StyledWrapper>;
    }

    if (!productsState.value) {
        return null;
    }

    const productCollection = productsState.value;

    if (productCollection.products!.length === 0) {
        return <StyledWrapper {...styles.wrapper}>
            <StyledWrapper {...styles.centeringWrapper} data-test-selector="productListNoneFound">
                <Typography {...styles.noProductsText}>{translate("No products found")}</Typography>
            </StyledWrapper>
        </StyledWrapper>;
    }

    return (
        <StyledWrapper {...styles.wrapper}>
            <ProductListPageDataContext.Consumer>
                {({ ref }) => {
                    return (ref ? <span ref={ref} tabIndex={-1}/> : undefined);
                }}
            </ProductListPageDataContext.Consumer>
            <LoadingOverlay loading={productsState.isLoading}>
                <Hidden below="md">
                    <CardList extendedStyles={styles.cardList} data-test-selector={`productListCardContainer${view}`}>
                        {productCollection.products!.map(product =>
                            <ProductContext.Provider value={product} key={product.id.toString()}>
                                    {view === "List"
                                        ? <CardContainer extendedStyles={styles.cardContainerStyles}>
                                            <ProductListProductCard {...fields} />
                                        </CardContainer>
                                    : <CardContainerMultiColumn extendedStyles={styles.cardContainerMultiColumnStyles}>
                                            <ProductListProductGridCard {...fields} />
                                        </CardContainerMultiColumn>
                                    }
                            </ProductContext.Provider>,
                            )
                        }
                    </CardList>
                </Hidden>
                <Hidden above="sm">
                    <CardList extendedStyles={styles.cardList} data-test-selector="cardListProductsNarrow">
                        {productCollection.products!.map(product =>
                            <ProductContext.Provider value={product} key={product.id.toString()}>
                                <CardContainer extendedStyles={styles.cardContainerStyles}>
                                    <ProductListProductCard {...fields} />
                                </CardContainer>
                            </ProductContext.Provider>,
                            )
                        }
                    </CardList>
                </Hidden>
            </LoadingOverlay>
        </StyledWrapper>
    );
};

const widgetModule: WidgetModule = {

    component: connect(mapStateToProps)(ProductListCardList),
    definition: {
        group: "Product List",
        displayName: "Card List",
        allowedContexts: [ProductListPageContext],
        isSystem: true,
        fieldDefinitions: [
            {
                name: fields.showImage,
                displayName: "Show Image",
                editorTemplate: "CheckboxField",
                defaultValue: true,
                fieldType: "General",
                sortOrder: 1,
            },
            {
                name: fields.showCompare,
                displayName: "Show Compare",
                editorTemplate: "CheckboxField",
                defaultValue: true,
                fieldType: "General",
                sortOrder: 2,
            },
            {
                name: fields.showBrand,
                displayName: "Show Brand",
                editorTemplate: "CheckboxField",
                defaultValue: true,
                fieldType: "General",
                sortOrder: 3,
            },
            {
                name: fields.showTitle,
                displayName: "Show Title",
                editorTemplate: "CheckboxField",
                defaultValue: true,
                fieldType: "General",
                sortOrder: 4,
            },
            {
                name: fields.showPartNumbers,
                displayName: "Show Part Numbers",
                editorTemplate: "CheckboxField",
                defaultValue: true,
                fieldType: "General",
                sortOrder: 5,
            },
            {
                name: fields.showAvailability,
                displayName: "Show Availability",
                editorTemplate: "CheckboxField",
                defaultValue: true,
                fieldType: "General",
                sortOrder: 6,
            },
            {
                name: fields.showAttributes,
                displayName: "Show Attributes",
                editorTemplate: "CheckboxField",
                defaultValue: true,
                fieldType: "General",
                sortOrder: 7,
            },
            {
                name: fields.showPrice,
                displayName: "Show Price",
                editorTemplate: "CheckboxField",
                defaultValue: true,
                fieldType: "General",
                sortOrder: 8,
            },
            {
                name: fields.showAddToList,
                displayName: "Show Add To List",
                editorTemplate: "CheckboxField",
                defaultValue: true,
                fieldType: "General",
                sortOrder: 9,
            },
        ],
    },
};

export default widgetModule;