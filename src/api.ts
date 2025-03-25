import { ref, get, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { policeStationsDb, pgVerificationsDb, storage } from './firebase';
import { TenantFormData, PGOwner } from './types';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const imageRef = storageRef(storage, `${path}/${fileName}`);
    
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const fetchStates = async (): Promise<string[]> => {
  try {
    const statesRef = ref(policeStationsDb, 'states');
    const snapshot = await get(statesRef);
    if (snapshot.exists()) {
      return Object.keys(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

export const fetchDistricts = async (state: string): Promise<string[]> => {
  try {
    const districtsRef = ref(policeStationsDb, `states/${state}/districts`);
    const snapshot = await get(districtsRef);
    if (snapshot.exists()) {
      return Object.keys(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

export const fetchPoliceStations = async (state: string, district: string): Promise<string[]> => {
  try {
    const stationsRef = ref(policeStationsDb, `states/${state}/districts/${district}`);
    const snapshot = await get(stationsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data);
    }
    return [];
  } catch (error) {
    console.error('Error fetching police stations:', error);
    return [];
  }
};

export const fetchPGOwnerByMobile = async (mobileNo: string): Promise<PGOwner | null> => {
  try {
    const ownerRef = ref(pgVerificationsDb, `Owners/${mobileNo}/Owner Details`);
    const snapshot = await get(ownerRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        mobileNo,
        name: data.name || '',
        pgName: data.pgName || '',
        address: data.address || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching PG owner:', error);
    return null;
  }
};

export const saveTenantData = async (ownerMobileNo: string, tenantData: TenantFormData): Promise<void> => {
  try {
    const tenantRef = ref(pgVerificationsDb, `Owners/${ownerMobileNo}/Tenants/${tenantData.mobileNo}`);
    
    await set(tenantRef, {
      personalInfo: {
        firstName: tenantData.firstName,
        lastName: tenantData.lastName,
        mobileNo: tenantData.mobileNo,
        email: tenantData.email,
        dateOfBirth: tenantData.dateOfBirth,
        religion: tenantData.religion,
        occupation: tenantData.occupation
      },
      familyMember: {
        firstName: tenantData.familyMember.firstName,
        lastName: tenantData.familyMember.lastName,
        mobileNo: tenantData.familyMember.mobileNo,
        relation: tenantData.familyMember.relation
      },
      presentAddress: {
        ownerMobileNo: tenantData.presentAddress.ownerMobileNo,
        pgName: tenantData.presentAddress.pgName
      },
      permanentAddress: {
        state: tenantData.permanentAddress.state,
        district: tenantData.permanentAddress.district,
        policeStation: tenantData.permanentAddress.policeStation,
        houseNo: tenantData.permanentAddress.houseNo || '',
        streetName: tenantData.permanentAddress.streetName || '',
        locality: tenantData.permanentAddress.locality || '',
        city: tenantData.permanentAddress.city,
        tehsil: tenantData.permanentAddress.tehsil || '',
        pincode: tenantData.permanentAddress.pincode
      },
      documents: {
        photoIdType: tenantData.documents.photoIdType,
        photoIdNumber: tenantData.documents.photoIdNumber,
        photo: tenantData.documents.photo,
        addressProof: tenantData.documents.addressProof
      },
      registrationDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving tenant data:', error);
    throw error;
  }
};