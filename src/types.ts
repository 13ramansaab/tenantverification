export interface TenantFormData {
  firstName: string;
  lastName: string;
  mobileNo: string;
  email: string;
  dateOfBirth: string;
  religion: 'Hindu' | 'Muslim' | 'Sikh' | 'Christian' | 'Others';
  occupation: 'Service';
  gender: 'M' | 'F' | 'Other';
  familyMember: {
    firstName: string;
    lastName: string;
    mobileNo: string;
    relation: 'D/O' | 'S/O' | 'W/O' | 'Wd/O';
  };
  presentAddress: {
    ownerMobileNo: string;
    pgId: string; // New field to store specific PG ID
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
    aadharFront: string;
    aadharBack: string;
  };
}

export interface PGOwner {
  mobileNo: string;
  name: string;
  email?: string;
  pgs: PGDetails[];
}

export interface PGDetails {
  id: string;
  pgName: string;
  address: string;
  houseNo?: string;
  streetName?: string;
  locality?: string;
  city?: string;
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
  payment_session_id: string;
}