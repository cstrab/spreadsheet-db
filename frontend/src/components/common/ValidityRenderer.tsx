import { ICellRendererParams } from 'ag-grid-community';

const ValidityRenderer = (props: ICellRendererParams) => {
    const isValid = props.data.isValid;
    return (
        <span>{isValid ? 'Valid' : 'Invalid'}</span>
    );
};

export default ValidityRenderer;
