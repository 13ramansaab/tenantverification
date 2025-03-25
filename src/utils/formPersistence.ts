import { TenantFormData } from '../types';

const FORM_DATA_KEY = 'tenant_registration_form_data';

export const saveFormData = (data: TenantFormData) => {
  try {
    // Remove file data before saving
    const dataToSave = {
      ...data,
      documents: {
        ...data.documents,
        photo: '',
        addressProof: ''
      }
    };
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving form data:', error);
  }
};

export const loadFormData = (): TenantFormData | null => {
  try {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error('Error loading form data:', error);
    return null;
  }
};

export const clearFormData = () => {
  try {
    localStorage.removeItem(FORM_DATA_KEY);
  } catch (error) {
    console.error('Error clearing form data:', error);
  }
};