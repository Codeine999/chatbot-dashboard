import Rick6 from '@/assets/6.webp'


export const overviewData = [
  { 
    totalmoney: {
      label: "Total Money",
      total: 3308
    }
  },
  { 
    todaymoney: {
      label: "Today Money",
      total: 15000
    }
  },
  { 
    allusers: {
      label: "All User",
      total: 400
    }
  }
];


export const ordernotic = [
  {
    orderID: "KmakO-111",
    username: "codeine",
    firstname: "petunda",
    lastname: "paksa",
    email: "pet@gmail.com",
    phone: "984943823",
    address: "123 main ST cityville 12345",
    productName: "Rick OWENS RAMONS DRKSHDW",
    quantity: "12",
    price: "1001",
    total: "1002",
    status: "peding",
    paymentsMethod: "Sprit",
    time: "12.44 pm",
    detail: "Officia duis officia cillum aute voluptate laborum Lorem",
    img: Rick6,
  },
    {
    orderID: "KmakO-111",
    username: "codeine2",
    email: "pet@gmail.com",
    phone: "984943823",
    address: "123 main ST cityville 12345",
    productName: "Rick OWENS RAMONS DRKSHDW",
    quantity: "12",
    price: "1001",
    total: "1002",
    status: "peding",
    paymentsMethod: "Sprit",
    time: "12.44 pm",
    detail: "Officia duis officia cillum aute voluptate laborum Lorem",
    img: Rick6,
  },
  {
    orderID: "KmakO-111",
    username: "codeine3",
    email: "pet@gmail.com",
    phone: "984943823",
    address: "123 main ST cityville 12345",
    productName: "Rick OWENS RAMONS DRKSHDW",
    quantity: "12",
    price: "1001",
    total: "1002",
    status: "peding",
    paymentsMethod: "Sprit",
    time: "12.44 pm",
    detail: "Officia duis officia cillum aute voluptate laborum Lorem",
    img: Rick6,
  },
  {
    orderID: "KmakO-111",
    username: "codeine4",
    email: "pet@gmail.com",
    phone: "984943823",
    address: "123 main ST cityville 12345",
    productName: "Rick OWENS RAMONS DRKSHDW",
    quantity: "12",
    price: "1001",
    total: "1002",
    status: "peding",
    paymentsMethod: "Sprit",
    time: "12.44 pm",
    detail: "Officia duis officia cillum aute voluptate laborum Lorem",
    img: Rick6,
  },
    {
    orderID: "KmakO-111",
    username: "codeine5",
    email: "pet@gmail.com",
    phone: "984943823",
    address: "123 main ST cityville 12345",
    productName: "Rick OWENS RAMONS DRKSHDW",
    quantity: "12",
    price: "1001",
    total: "1002",
    status: "peding",
    paymentsMethod: "Sprit",
    time: "12.44 pm",
    detail: "Officia duis officia cillum aute voluptate laborum Lorem",
    img: Rick6,
  },
    {
    orderID: "KmakO-111",
    username: "codeine4",
    email: "pet@gmail.com",
    phone: "984943823",
    address: "123 main ST cityville 12345",
    productName: "Rick OWENS RAMONS DRKSHDW",
    quantity: "12",
    price: "1001",
    total: "1002",
    status: "peding",
    paymentsMethod: "Sprit",
    time: "12.44 pm",
    detail: "Officia duis officia cillum aute voluptate laborum Lorem",
    img: Rick6,
  },
      {
    orderID: "KmakO-111",
    username: "codeine4",
    email: "pet@gmail.com",
    phone: "984943823",
    address: "123 main ST cityville 12345",
    productName: "Rick OWENS RAMONS DRKSHDW",
    quantity: "12",
    price: "1001",
    total: "1002",
    status: "peding",
    paymentsMethod: "Sprit",
    time: "12.44 pm",
    detail: "Officia duis officia cillum aute voluptate laborum Lorem",
    img: Rick6,
  },
      {
    orderID: "KmakO-111",
    username: "codeine4",
    email: "pet@gmail.com",
    phone: "984943823",
    address: "123 main ST cityville 12345",
    productName: "Rick OWENS RAMONS DRKSHDW",
    quantity: "12",
    price: "1001",
    total: "1002",
    status: "peding",
    paymentsMethod: "Sprit",
    time: "12.44 pm",
    detail: "Officia duis officia cillum aute voluptate laborum Lorem",
    img: Rick6,
  },
  {
    orderID: "KmakO-111",
    username: "codeine4",
    email: "pet@gmail.com",
    phone: "984943823",
    address: "123 main ST cityville 12345",
    productName: "Rick OWENS RAMONS DRKSHDW",
    quantity: "12",
    price: "1001",
    total: "1002",
    status: "peding",
    paymentsMethod: "Sprit",
    time: "12.44 pm",
    detail: "Officia duis officia cillum aute voluptate laborum Lorem",
    img: Rick6,
  },
]

export type OrderListItem = {
  orderID: string;
  name: string;
  detail: string;
  status: "Pending" | "Paid" | "Cancel";
  time: string;
};

export const orderList: OrderListItem[] = [];

export const orderdetail = [
  { 
    img: Rick6,

    username: "codeine",
    name: "Rick OWENS RAMONS DRKSHDW",
    quantity: "12",
    price: "8001"
  },
  { 
    img: Rick6, 
    name: "Rick OWENS RAMONS",
    quantity: "2",
    price: "1800"
  },
  { 
    img: Rick6, 
    name: "Rick OWENS RAMONS DRKSHDW",
    quantity: "2",
    price: "12000"
  },
];