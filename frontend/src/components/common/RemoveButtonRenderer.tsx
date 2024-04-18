import { ICellRendererParams } from 'ag-grid-community';

const RemoveButtonRenderer = (props: ICellRendererParams) => {
    return (
        <button onClick={() => props.context.handleRemoveRow(props)} disabled={props.context.isFileUploaded}>
            Remove
        </button>
    );
};

export default RemoveButtonRenderer;
