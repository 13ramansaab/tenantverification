import React, { useState, useEffect } from 'react';
import { TenantFormData } from '../types';
import { fetchPGOwnerByMobile, saveTenantData, fetchStates, fetchDistricts, fetchPoliceStations, uploadImage } from '../api';
import { saveFormData, loadFormData, clearFormData } from '../utils/formPersistence';
import SuccessPage from './SuccessPage';
import Footer from './Footer';

const defaultFormData: TenantFormData = {
  firstName: '',
  lastName: '',
  mobileNo: '',
  email: '',
  dateOfBirth: '',
  religion: 'Hindu',
  occupation: 'Service',
  familyMember: {
    firstName: '',
    lastName: '',
    mobileNo: '',
    relation: 'S/O'
  },
  presentAddress: {
    ownerMobileNo: '',
    pgName: ''
  },
  permanentAddress: {
    state: '',
    district: '',
    policeStation: '',
    houseNo: '',
    streetName: '',
    locality: '',
    city: '',
    tehsil: '',
    pincode: ''
  },
  documents: {
    photoIdType: 'Aadhar Card',
    photoIdNumber: '',
    photo: '',
    addressProof: ''
  }
};

function RegistrationForm() {
  const [formData, setFormData] = useState<TenantFormData>(defaultFormData);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [policeStations, setPoliceStations] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      setFormData(savedData);
    }
  }, []);

  useEffect(() => {
    if (!isSubmitting) {
      saveFormData(formData);
    }
  }, [formData, isSubmitting]);

  useEffect(() => {
    const loadStates = async () => {
      const statesList = await fetchStates();
      setStates(statesList);
    };
    loadStates();
  }, []);

  useEffect(() => {
    const loadDistricts = async () => {
      if (formData.permanentAddress.state) {
        const districtsList = await fetchDistricts(formData.permanentAddress.state);
        setDistricts(districtsList);
        setFormData(prev => ({
          ...prev,
          permanentAddress: {
            ...prev.permanentAddress,
            district: '',
            policeStation: ''
          }
        }));
      }
    };
    loadDistricts();
  }, [formData.permanentAddress.state]);

  useEffect(() => {
    const loadPoliceStations = async () => {
      if (formData.permanentAddress.state && formData.permanentAddress.district) {
        const stationsList = await fetchPoliceStations(
          formData.permanentAddress.state,
          formData.permanentAddress.district
        );
        setPoliceStations(stationsList);
        setFormData(prev => ({
          ...prev,
          permanentAddress: {
            ...prev.permanentAddress,
            policeStation: ''
          }
        }));
      }
    };
    loadPoliceStations();
  }, [formData.permanentAddress.state, formData.permanentAddress.district]);

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      if (formData.presentAddress.ownerMobileNo) {
        const owner = await fetchPGOwnerByMobile(formData.presentAddress.ownerMobileNo);
        if (owner) {
          setFormData(prev => ({
            ...prev,
            presentAddress: {
              ...prev.presentAddress,
              pgName: owner.pgName || ''
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            presentAddress: {
              ...prev.presentAddress,
              pgName: ''
            }
          }));
        }
      }
    };
    fetchOwnerDetails();
  }, [formData.presentAddress.ownerMobileNo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'addressProof') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('File size must be less than 1MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }

      if (field === 'photo') {
        setPhotoFile(file);
      } else {
        setAddressProofFile(file);
      }
      
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: objectUrl
        }
      }));
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setPhotoFile(null);
    setAddressProofFile(null);
    setShowSuccess(false);
    setTermsAccepted(false);
    setSubmitError(null);
    clearFormData();
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data?')) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!termsAccepted) {
      setSubmitError('Please accept the Terms & Conditions to proceed.');
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadPromises: Promise<string>[] = [];
      
      if (photoFile) {
        uploadPromises.push(uploadImage(photoFile, `tenants/${formData.mobileNo}/photo`));
      }
      
      if (addressProofFile) {
        uploadPromises.push(uploadImage(addressProofFile, `tenants/${formData.mobileNo}/addressProof`));
      }

      const [photoUrl, addressProofUrl] = await Promise.all(uploadPromises);

      const updatedFormData: TenantFormData = {
        ...formData,
        documents: {
          ...formData.documents,
          photo: photoUrl || formData.documents.photo,
          addressProof: addressProofUrl || formData.documents.addressProof
        }
      };

      await saveTenantData(formData.presentAddress.ownerMobileNo, updatedFormData);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error saving tenant data:', error);
      setSubmitError('Error saving tenant data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return <SuccessPage onBack={resetForm} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tenant Registration Form</h1>
            <button
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2 text-sm text-red-500 hover:text-red-700 font-medium"
              disabled={isSubmitting}
            >
              Clear Form
            </button>
          </div>
          
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="border rounded p-2"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="border rounded p-2"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  className="border rounded p-2"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({...formData, mobileNo: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border rounded p-2"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="date"
                  placeholder="Date of Birth"
                  className="border rounded p-2"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
                <select
                  className="border rounded p-2"
                  value={formData.religion}
                  onChange={(e) => setFormData({...formData, religion: e.target.value as any})}
                  required
                  disabled={isSubmitting}
                >
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Christian">Christian</option>
                  <option value="Others">Others</option>
                </select>
                <select
                  className="border rounded p-2"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value as any})}
                  required
                  disabled={isSubmitting}
                >
                  <option value="Service">Service</option>
                </select>
              </div>
            </div>

            {/* Family Member Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Family Member Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="border rounded p-2"
                  value={formData.familyMember.firstName}
                  onChange={(e) => setFormData({
                    ...formData,
                    familyMember: {...formData.familyMember, firstName: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="border rounded p-2"
                  value={formData.familyMember.lastName}
                  onChange={(e) => setFormData({
                    ...formData,
                    familyMember: {...formData.familyMember, lastName: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  className="border rounded p-2"
                  value={formData.familyMember.mobileNo}
                  onChange={(e) => setFormData({
                    ...formData,
                    familyMember: {...formData.familyMember, mobileNo: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
                <select
                  className="border rounded p-2"
                  value={formData.familyMember.relation}
                  onChange={(e) => setFormData({
                    ...formData,
                    familyMember: {...formData.familyMember, relation: e.target.value as any}
                  })}
                  required
                  disabled={isSubmitting}
                >
                  <option value="S/O">S/O</option>
                  <option value="D/O">D/O</option>
                  <option value="W/O">W/O</option>
                  <option value="Wd/O">Wd/O</option>
                </select>
              </div>
            </div>

            {/* Present Address */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Present Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="Owner Mobile Number"
                  className="border rounded p-2"
                  value={formData.presentAddress.ownerMobileNo}
                  onChange={(e) => setFormData({
                    ...formData,
                    presentAddress: {...formData.presentAddress, ownerMobileNo: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  placeholder="PG Name"
                  className="border rounded p-2"
                  value={formData.presentAddress.pgName}
                  readOnly
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Permanent Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="border rounded p-2"
                  value={formData.permanentAddress.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    permanentAddress: {...formData.permanentAddress, state: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <select
                  className="border rounded p-2"
                  value={formData.permanentAddress.district}
                  onChange={(e) => setFormData({
                    ...formData,
                    permanentAddress: {...formData.permanentAddress, district: e.target.value}
                  })}
                  required
                  disabled={!formData.permanentAddress.state || isSubmitting}
                >
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <select
                  className="border rounded p-2"
                  value={formData.permanentAddress.policeStation}
                  onChange={(e) => setFormData({
                    ...formData,
                    permanentAddress: {...formData.permanentAddress, policeStation: e.target.value}
                  })}
                  required
                  disabled={!formData.permanentAddress.district || isSubmitting}
                >
                  <option value="">Select Police Station</option>
                  {policeStations.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="House No."
                  className="border rounded p-2"
                  value={formData.permanentAddress.houseNo}
                  onChange={(e) => setFormData({
                    ...formData,
                    permanentAddress: {...formData.permanentAddress, houseNo: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  placeholder="Street Name"
                  className="border rounded p-2"
                  value={formData.permanentAddress.streetName}
                  onChange={(e) => setFormData({
                    ...formData,
                    permanentAddress: {...formData.permanentAddress, streetName: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  placeholder="Colony/Locality/Area"
                  className="border rounded p-2"
                  value={formData.permanentAddress.locality}
                  onChange={(e) => setFormData({
                    ...formData,
                    permanentAddress: {...formData.permanentAddress, locality: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  placeholder="Village/Town/City"
                  className="border rounded p-2"
                  value={formData.permanentAddress.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    permanentAddress: {...formData.permanentAddress, city: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  placeholder="Tehsil/Block"
                  className="border rounded p-2"
                  value={formData.permanentAddress.tehsil}
                  onChange={(e) => setFormData({
                    ...formData,
                    permanentAddress: {...formData.permanentAddress, tehsil: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  className="border rounded p-2"
                  value={formData.permanentAddress.pincode}
                  onChange={(e) => setFormData({
                    ...formData,
                    permanentAddress: {...formData.permanentAddress, pincode: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Documents</h2>
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="border rounded p-2"
                  value={formData.documents.photoIdType}
                  onChange={(e) => setFormData({
                    ...formData,
                    documents: {...formData.documents, photoIdType: e.target.value as any}
                  })}
                  required
                  disabled={isSubmitting}
                >
                  <option value="Aadhar Card">Aadhar Card</option>
                  <option value="Voter Card">Voter Card</option>
                  <option value="Driving License">Driving License</option>
                </select>
                <input
                  type="text"
                  placeholder="Photo ID Number"
                  className="border rounded p-2"
                  value={formData.documents.photoIdNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    documents: {...formData.documents, photoIdNumber: e.target.value}
                  })}
                  required
                  disabled={isSubmitting}
                />
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Size Photo
                    <span className="text-xs text-gray-500 ml-2">(Max size: 1MB, Format: PNG/JPG)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full border rounded p-2"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    required={!formData.documents.photo}
                    disabled={isSubmitting}
                  />
                  {formData.documents.photo && (
                    <div className="mt-2">
                      <img
                        src={formData.documents.photo}
                        alt="Preview"
                        className="h-32 object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Proof (Aadhar Card)
                    <span className="text-xs text-gray-500 ml-2">(Max size: 1MB, Format: PNG/JPG)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full border rounded p-2"
                    onChange={(e) => handleFileChange(e, 'addressProof')}
                    required={!formData.documents.addressProof}
                    disabled={isSubmitting}
                  />
                  {formData.documents.addressProof && (
                    <div className="mt-2">
                      <img
                        src={formData.documents.addressProof}
                        alt="Preview"
                        className="h-32 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="border-t pt-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-900">
                    I agree to the Terms & Conditions
                  </label>
                  <p className="text-gray-500 mt-1">
                    I hereby declare that all the information provided above is true and correct to the best of my knowledge. 
                    I understand that I will be solely responsible for any discrepancy found in the information provided. 
                    I agree that any false statements, misrepresentations, or omissions may result in the rejection of my 
                    registration or subsequent legal action. I authorize the verification of the information provided above.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit Registration'}
            </button>
          </form>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default RegistrationForm;