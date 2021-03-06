import PageProps from "@insite/client-framework/Types/PageProps";
import Icon from "@insite/mobius/Icon";
import Calendar from "@insite/mobius/Icons/Calendar";
import Edit from "@insite/mobius/Icons/Edit";
import DebugMenu from "@insite/shell/Components/Icons/DebugMenu";
import BrandSelection from "@insite/shell/Components/PageEditor/BrandSelection";
import CategorySelection from "@insite/shell/Components/PageEditor/CategorySelection";
import ProductSelection from "@insite/shell/Components/PageEditor/ProductSelection";
import PublishDropDown from "@insite/shell/Components/PageEditor/PublishDropDown";
import { Spacer } from "@insite/shell/Components/Shell/HeaderBar";
import HeaderPublishStatus from "@insite/shell/Components/Shell/HeaderPublishStatus";
import { LoadedPageDefinition } from "@insite/shell/DefinitionTypes";
import { getPageState } from "@insite/shell/Services/ContentAdminService";
import { getAutoUpdatedPageTypes } from "@insite/shell/Services/SpireService";
import shellTheme, { ShellThemeProps } from "@insite/shell/ShellTheme";
import {
    editPageOptions,
    toggleShowGeneratedPageTemplate,
} from "@insite/shell/Store/PageEditor/PageEditorActionCreators";
import { setContentMode } from "@insite/shell/Store/ShellContext/ShellContextActionCreators";
import ShellState from "@insite/shell/Store/ShellState";
import * as React from "react";
import { connect, ResolveThunks } from "react-redux";
import styled from "styled-components";

interface OwnProps {
    page: PageProps;
    pageDefinition: LoadedPageDefinition;
}

type Props = ReturnType<typeof mapStateToProps> & ResolveThunks<typeof mapDispatchToProps> & OwnProps;

const mapStateToProps = (state: ShellState, { page }: OwnProps) => {
    const {
        pageTree: { treeNodesByParentId, headerTreeNodesByParentId, footerTreeNodesByParentId },
        shellContext: { contentMode, permissions },
    } = state;

    return {
        contentMode,
        permissions,
        futurePublishOn: getPageState(
            page.id,
            treeNodesByParentId[page.parentId],
            headerTreeNodesByParentId[page.parentId],
            footerTreeNodesByParentId[page.parentId],
        )?.futurePublishOn,
    };
};

const mapDispatchToProps = {
    toggleShowGeneratedPageTemplate,
    setContentMode,
    editPageOptions,
};

interface State {
    autoUpdatedPageTypes?: string[];
}

class Header extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    async componentDidMount() {
        const { autoUpdatedPageTypes } = await getAutoUpdatedPageTypes();
        this.setState({
            autoUpdatedPageTypes,
        });
    }

    editPageOptions = () => {
        this.props.editPageOptions(this.props.page.id);
    };

    render() {
        const {
            page,
            pageDefinition,
            toggleShowGeneratedPageTemplate,
            contentMode,
            permissions,
            futurePublishOn,
        } = this.props;

        const autoUpdatedPage = this.state.autoUpdatedPageTypes?.includes(page.type) ?? false;
        return (
            <PageHeaderStyle>
                <PageHeaderTitle data-test-selector="shell_title">{page.name}</PageHeaderTitle>
                <Icon src={Spacer} color="#999" />
                <Icon src={Calendar} size={20} color={shellTheme.colors.text.main} />
                <HeaderPublishStatus />
                {contentMode === "Editing" && (
                    <>
                        <Icon src={Spacer} color="#999" />
                        {permissions?.canEditWidget && (!futurePublishOn || futurePublishOn < new Date()) && (
                            <PageHeaderButton onClick={this.editPageOptions} data-test-selector="shell_editPage">
                                <Icon src={Edit} size={20} color={shellTheme.colors.text.main} />
                            </PageHeaderButton>
                        )}
                        <PageHeaderButton onClick={toggleShowGeneratedPageTemplate}>
                            <DebugMenu color1={shellTheme.colors.text.main} size={16} />
                        </PageHeaderButton>
                    </>
                )}

                {!pageDefinition && <div>There was no component found for the type '{page.type}'</div>}
                {pageDefinition?.supportsProductSelection && <ProductSelection />}
                {pageDefinition?.supportsCategorySelection && <CategorySelection />}
                {pageDefinition?.supportsBrandSelection && <BrandSelection />}
                {autoUpdatedPage && contentMode === "Editing" && (
                    <AutoUpdateWarning>
                        This page is configured to be auto updated. Any edits made may be overwritten.
                    </AutoUpdateWarning>
                )}
                {contentMode !== "Viewing" && (
                    <PublishDropDownStyle>
                        <PublishDropDown />
                    </PublishDropDownStyle>
                )}
            </PageHeaderStyle>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);

const AutoUpdateWarning = styled.span`
    color: ${(props: ShellThemeProps) => props.theme.colors.danger.main};
    font-weight: bold;
    margin-left: 8px;
`;

const PageHeaderStyle = styled.div`
    background-color: ${(props: ShellThemeProps) => props.theme.colors.common.background};
    height: 48px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #dedede;
`;

const PageHeaderTitle = styled.h2`
    color: ${(props: ShellThemeProps) => props.theme.colors.text.main};
    align-content: center;
    padding-left: 16px;
    font-size: 18px;
    line-height: 21px;
    font-weight: bold;
`;

const PageHeaderButton = styled.button`
    background-color: transparent;
    border: none;
    height: 100%;
    min-width: 30px;
    display: inline-block;
    cursor: pointer;
    &:focus {
        outline: none;
    }
    position: relative;
    font-family: ${(props: ShellThemeProps) => props.theme.typography.body.fontFamily};
    &:hover {
        background-color: #f4f4f4;
    }
`;

const PublishDropDownStyle = styled.div`
    margin-left: auto;
    margin-right: 30px;
    display: flex;
`;
