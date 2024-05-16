import { ICellRendererParams } from 'ag-grid-community';
import { Button } from '@mui/material';
import '../../styles/styles.css';

const RemoveButtonRenderer = (props: ICellRendererParams) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3px'}}>
            <Button onClick={() => props.context.handleRemoveRow(props)} disabled={props.context.isFileUploaded}>
                Remove
            </Button>
        </div>
    );
};

export default RemoveButtonRenderer;
