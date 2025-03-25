export interface TenantFormData {
  firstName: string;
  lastName: string;
  mobileNo: string;
  email: string;
  dateOfBirth: string;
  religion: 'Hindu' | 'Muslim' | 'Sikh' | 'Christian' | 'Others';
  occupation: 'Service';
  familyMember: {
    firstName: string;
    lastName: string;
    mobileNo: string;
    relation: 'D/O' | 'S/O' | 'W/O' | 'Wd/O';
  };
  presentAddress: {
    ownerMobileNo: string;
    pgName: string;
  };
  permanentAddress: {
    state: string;
    district: string;
    policeStation: string;
    houseNo: string;
    streetName: string;
    locality: string;
    city: string;
    tehsil: string;
    pincode: string;
  };
  documents: {
    photoIdType: 'Aadhar Card' | 'Voter Card' | 'Driving License';
    photoIdNumber: string;
    photo: string;
    addressProof: string;
  };
  payment?: {
    status: 'pending' | 'completed';
    amount: number;
    transactionId?: string;
    timestamp?: string;
  };
}

export interface PGOwner {
  mobileNo: string;
  name: string;
  pgName: string;
  address: string;
}

export interface PaymentData {
  amount: number;
  transactionId: string;
  timestamp: string;
}

export interface CashfreeOrderResponse {
  payment_link: string;
  order_status: string;
  order_id: string;
}

export interface CashfreeWebhookData {
  order: {
    order_id: string;
    order_amount: number;
    order_status: string;
    order_currency: string;
    order_tags: Record<string, string>;
  };
  payment: {
    payment_id: string;
    payment_status: string;
    payment_amount: number;
    payment_currency: string;
    payment_message: string;
    payment_time: string;
    payment_method: {
      payment_method_id: string;
      payment_method_type: string;
    };
  };
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
  event_time: string;
  type: string;
}