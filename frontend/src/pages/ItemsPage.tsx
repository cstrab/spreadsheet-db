import React from 'react';
import { GenericGrid } from '../components/common/GenericGrid';

const GET_ITEMS_ENDPOINT = process.env.REACT_APP_GET_ITEMS_ENDPOINT || '/items';
const UPDATE_ITEMS_ENDPOINT = process.env.REACT_APP_UPDATE_ITEMS_ENDPOINT || '/items/update';

export const ItemsPage: React.FC = () => {
  return (
    <GenericGrid 
      getEndpointTable={GET_ITEMS_ENDPOINT}
      updateEndpointTable={UPDATE_ITEMS_ENDPOINT}
    />
  );
};
