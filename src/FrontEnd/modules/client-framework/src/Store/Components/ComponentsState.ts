import AddressDrawerState from "@insite/client-framework/Store/Components/AddressDrawer/AddressDrawerState";
import AddToListModalState from "@insite/client-framework/Store/Components/AddToListModal/AddToListModalState";
import BreadcrumbsState from "@insite/client-framework/Store/Components/Breadcrumbs/BreadcrumbsState";
import CompareProductsDrawerState from "@insite/client-framework/Store/Components/CompareProductsDrawer/CompareProductsDrawerState";
import ContactUsFormState from "@insite/client-framework/Store/Components/ContactUsForm/ContactUsFormState";
import FindLocationModalState from "@insite/client-framework/Store/Components/FindLocationModal/FindLocationModalState";
import ManageShareListModalState from "@insite/client-framework/Store/Components/ManageShareListModal/ManageShareListModalState";
import OrderUploadState from "@insite/client-framework/Store/Components/OrderUpload/OrderUploadState";
import ProductInfoListsState from "@insite/client-framework/Store/Components/ProductInfoList/ProductInfoListsState";
import ProductSelectorState from "@insite/client-framework/Store/Components/ProductSelector/ProductSelectorState";
import ShareListModalState from "@insite/client-framework/Store/Components/ShareListModal/ShareListModalState";

export default interface ComponentsState {
    readonly addressDrawer: AddressDrawerState;
    readonly addToListModal: AddToListModalState;
    readonly breadcrumbs: BreadcrumbsState;
    readonly compareProductsDrawer: CompareProductsDrawerState;
    readonly contactUsForm: ContactUsFormState;
    readonly findLocationModal: FindLocationModalState;
    readonly manageShareListModal: ManageShareListModalState;
    readonly orderUpload: OrderUploadState;
    readonly productInfoLists: ProductInfoListsState;
    readonly productSelector: ProductSelectorState;
    readonly shareListModal: ShareListModalState;
}
