import { ref, get, set, push } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { policeStationsDb, pgVerificationsDb, storage } from './firebase';
import { TenantFormData, PGOwner, PGDetails } from './types';

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const fileRef = storageRef(storage, `${path}/${fileName}`);
    
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error uploading file:', error);
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
    const ownerRef = ref(pgVerificationsDb, `Owners/${mobileNo}`);
    const snapshot = await get(ownerRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const ownerDetails = data['Owner Details'];
      const pgs: PGDetails[] = [];
      
      // Convert PGs object to array
      if (data.PGs) {
        Object.entries(data.PGs).forEach(([id, pg]: [string, any]) => {
          pgs.push({
            id,
            pgName: pg.pgName,
            address: pg.address,
            houseNo: pg.houseNo,
            streetName: pg.streetName,
            locality: pg.locality,
            city: pg.city
          });
        });
      }
      
      return {
        mobileNo,
        name: ownerDetails.name || '',
        email: ownerDetails.email || '',
        pgs
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching PG owner:', error);
    return null;
  }
};

export const saveTenantData = async (ownerMobileNo: string, pgId: string, tenantData: TenantFormData): Promise<void> => {
  try {
    const tenantRef = ref(pgVerificationsDb, `Owners/${ownerMobileNo}/PGs/${pgId}/Tenants/${tenantData.mobileNo}`);
    
    await set(tenantRef, {
      personalInfo: {
        firstName: tenantData.firstName,
        lastName: tenantData.lastName,
        mobileNo: tenantData.mobileNo,
        email: tenantData.email,
        dateOfBirth: tenantData.dateOfBirth,
        religion: tenantData.religion,
        occupation: tenantData.occupation,
        gender: tenantData.gender
      },
      familyMember: {
        firstName: tenantData.familyMember.firstName,
        lastName: tenantData.familyMember.lastName,
        mobileNo: tenantData.familyMember.mobileNo,
        relation: tenantData.familyMember.relation
      },
      presentAddress: {
        ownerMobileNo: tenantData.presentAddress.ownerMobileNo,
        pgId: tenantData.presentAddress.pgId,
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
        aadharFront: tenantData.documents.aadharFront,
        aadharBack: tenantData.documents.aadharBack
      },
      registrationDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving tenant data:', error);
    throw error;
  }
};