import { useQuery, QueryHookOptions } from '@apollo/react-hooks';

import {
  GetOrderHistory,
  GetOrderHistoryVariables,
} from '../../generated/server/GetOrderHistory';
import { GET_ORDER_HISTORY } from '../../graphql/server/orderHistory';
import { OrderRecord, AddressItem } from '../../types/types';
import { defaultAddress } from '../../constants/defaultValue';
import { mapToLineItems } from '../../helpers/mapToLineItems';

function getOrders(
  customerData: GetOrderHistory | undefined,
): Array<OrderRecord> {
  if (customerData) {
    if (customerData.customer) {
      return customerData.customer.orders.edges.map((order) => {
        let {
          shippingAddress,
          lineItems,
          orderNumber,
          totalPriceV2,
          processedAt,
          subtotalPriceV2,
          totalShippingPriceV2,
          id,
        } = order.node;
        let address: AddressItem = defaultAddress;
        let newLineItems = mapToLineItems(lineItems);
        if (shippingAddress) {
          let {
            address1,
            city,
            country,
            id,
            name,
            phone,
            province,
            zip,
          } = shippingAddress;
          address = {
            address1: address1 ? address1 : '',
            city: city ? city : '',
            country: country ? country : '',
            id: id,
            name: name ? name : '',
            phone: phone ? phone : '',
            province: province ? province : '',
            zip: zip ? zip : '',
          };
        }
        let subtotalPaymentAmount = subtotalPriceV2
          ? subtotalPriceV2.amount
          : '0.00';
        return {
          subtotalPayment: Number(subtotalPaymentAmount),
          shippingPrice: Number(totalShippingPriceV2.amount),
          orderID: id,
          orderNumber: `#${orderNumber.toString()}`,
          orderTime: processedAt,
          totalPayment: Number(totalPriceV2.amount),
          lineItems: newLineItems,
          address,
        };
      });
    }
  }
  return [];
}

function useOrderHistoryQuery(
  options?: QueryHookOptions<GetOrderHistory, GetOrderHistoryVariables>,
) {
  let { data } = useQuery<GetOrderHistory, GetOrderHistoryVariables>(
    GET_ORDER_HISTORY,
    options,
  );

  return getOrders(data);
}

export { useOrderHistoryQuery };