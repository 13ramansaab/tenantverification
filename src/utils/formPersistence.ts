import { TenantFormData } from '../types';

const FORM_DATA_KEY = 'tenant_registration_form_data';
const FILE_PREVIEW_KEY = 'tenant_registration_file_previews';

interface FilePreviewData {
  photo?: string;
  aadharFront?: string;
  aadharBack?: string;
}

export const saveFormData = (data: TenantFormData) => {
  try {
    // Save form data without file contents
    const formDataToSave = {
      ...data,
      documents: {
        ...data.documents,
        photo: '',
        aadharFront: '',
        aadharBack: ''
      }
    };
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formDataToSave));

    // Separately save file previews if they exist
    const filePreviewData: FilePreviewData = {};
    if (data.documents.photo && data.documents.photo.startsWith('data:')) {
      filePreviewData.photo = data.documents.photo;
    }
    if (data.documents.aadharFront && data.documents.aadharFront.startsWith('data:')) {
      filePreviewData.aadharFront = data.documents.aadharFront;
    }
    if (data.documents.aadharBack && data.documents.aadharBack.startsWith('data:')) {
      filePreviewData.aadharBack = data.documents.aadharBack;
    }
    
    if (Object.keys(filePreviewData).length > 0) {
      localStorage.setItem(FILE_PREVIEW_KEY, JSON.stringify(filePreviewData));
    }
  } catch (error) {
    console.error('Error saving form data:', error);
  }
};

export const loadFormData = (): TenantFormData | null => {
  try {
    const savedFormData = localStorage.getItem(FORM_DATA_KEY);
    const savedFilePreviews = localStorage.getItem(FILE_PREVIEW_KEY);

    if (!savedFormData) {
      return null;
    }

    const formData: TenantFormData = JSON.parse(savedFormData);
    
    // Restore file previews if they exist
    if (savedFilePreviews) {
      const filePreviews: FilePreviewData = JSON.parse(savedFilePreviews);
      formData.documents.photo = filePreviews.photo || '';
      formData.documents.aadharFront = filePreviews.aadharFront || '';
      formData.documents.aadharBack = filePreviews.aadharBack || '';
    }

    return formData;
  } catch (error) {
    console.error('Error loading form data:', error);
    return null;
  }
};

export const clearFormData = () => {
  try {
    localStorage.removeItem(FORM_DATA_KEY);
    localStorage.removeItem(FILE_PREVIEW_KEY);
  } catch (error) {
    console.error('Error clearing form data:', error);
  }
};

export const handleFilePreview = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(reader.error);

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
};