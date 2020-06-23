import { GetWishListsApiParameter } from "@insite/client-framework/Services/WishListService";
import { AddWishListResult } from "@insite/client-framework/Store/Pages/MyLists/Handlers/AddWishList";
import { Draft } from "immer";
import { createTypedReducerWithImmer } from "@insite/client-framework/Common/CreateTypedReducer";
import MyListsState from "@insite/client-framework/Store/Pages/MyLists/MyListsState";
import { WishListCollectionModel } from "@insite/client-framework/Types/ApiModels";

const initialState: MyListsState = {
    getWishListsParameter: { page: 1, pageSize: 8, expand: ["top3products"], sort: "ModifiedOn DESC" },
};

const reducer = {
    "Pages/MyLists/UpdateLoadParameter": (draft: Draft<MyListsState>, action: { parameter: GetWishListsApiParameter; }) => {
        draft.getWishListsParameter = { ...draft.getWishListsParameter, ...action.parameter };

        for (const key in draft.getWishListsParameter) {
            const value = (<any>draft.getWishListsParameter)[key];

            // remove empty parameters
            if (value === "" || value === undefined) {
                delete (<any>draft.getWishListsParameter)[key];
            }
        }

        for (const key in action.parameter) {
            // go back to page 1 if any other parameters changed
            if (draft.getWishListsParameter.page && draft.getWishListsParameter.page > 1 && key !== "page") {
                draft.getWishListsParameter.page = 1;
            }
        }
    },
    "Pages/MyLists/BeginAddWishList": (draft: Draft<MyListsState>) => {
    },
    "Pages/MyLists/CompleteAddWishList": (draft: Draft<MyListsState>, action: { result: AddWishListResult; }) => {
    },
    "Pages/MyLists/BeginAddWishListLines": (draft: Draft<MyListsState>) => {
    },
    "Pages/MyLists/CompleteAddWishListLines": (draft: Draft<MyListsState>) => {
    },
    "Pages/MyLists/BeginDeleteWishList": (draft: Draft<MyListsState>) => {
    },
    "Pages/MyLists/CompleteDeleteWishList": (draft: Draft<MyListsState>) => {
    },
};

export default createTypedReducerWithImmer(initialState, reducer);