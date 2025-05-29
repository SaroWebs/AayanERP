import React, { useState, useRef } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Tabs, Textarea, TextInput, Group, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import AddressDetails from './AddressDetails';
import DocumentSubmitted from './Documents';
import type { Documents } from './Documents';
import EmploymentDetails from './EmploymentDetails';
import type { EmploymentDetail } from './EmploymentDetails';
import ServiceDetail from './Service_detail';
import type { ServiceDetail as ServiceDetailType } from './Service_detail';
import DocumentIssued from './DocumentIssued';
import type { DocumentIssue } from './DocumentIssued';
import OtherDetails from './OtherDetails';
import EducationalDetails from './EducationalDetails';
import ProfessionalDetails from './ProfessionalDetails';
import {
  EmployeeProfile,
  EducationalQualification,
  ProfessionalQualification,
  Address,
  Child,
  Spouse,
  Nominee,
  Reference,
  KnownLanguage,
  SpecialTraining,
  CurricularActivity,
  REQUIRED_EDUCATIONAL_FIELDS,
  REQUIRED_PROFESSIONAL_FIELDS
} from '../types';

const AddNew = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeTab, setActiveTab] = useState<string | null>('basic_profile');
  const formRef = useRef<HTMLFormElement>(null);

  // State for subcomponent data
  const [educationalList, setEducationalList] = useState<EducationalQualification[]>([]);
  const [educationalInput, setEducationalInput] = useState<EducationalQualification>({
    qualification_type: '',
    institution: '',
    board_university: '',
    year_of_passing: '',
    marks_percentage: '',
    grade: '',
    specialization: null,
    medium: '',
    subject: '',
  });
  const [editingEducationalIndex, setEditingEducationalIndex] = useState<number | null>(null);

  const [professionalList, setProfessionalList] = useState<ProfessionalQualification[]>([]);
  const [professionalInput, setProfessionalInput] = useState<ProfessionalQualification>({
    exam_name: '',
    institution: '',
    division: null,
    completion_year: '',
    certificate_number: null,
    valid_from: null,
    valid_until: null,
    remarks: null
  });
  const [editingProfessionalIndex, setEditingProfessionalIndex] = useState<number | null>(null);

  // Add new state for all other components
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [documents, setDocuments] = useState<Documents[]>([]);
  const [serviceDetails, setServiceDetails] = useState<ServiceDetailType[]>([]);
  const [employmentDetails, setEmploymentDetails] = useState<EmploymentDetail[]>([]);
  const [documentIssued, setDocumentIssued] = useState<DocumentIssue[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [spouses, setSpouses] = useState<Spouse[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [knownLanguages, setKnownLanguages] = useState<KnownLanguage[]>([]);
  const [specialTrainings, setSpecialTrainings] = useState<SpecialTraining[]>([]);
  const [curricularActivities, setCurricularActivities] = useState<CurricularActivity[]>([]);

  const form = useForm<EmployeeProfile>({
    initialValues: {
      first_name: '',
      last_name: null,
      pf_no: null,
      date_of_birth: null,
      gender: 'male',
      blood_group: null,
      pan_no: null,
      aadhar_no: null,
      guardian_name: null,
      contact_no: null,
      email: null,
      country: null,
    },
    validateInputOnBlur: false,
    validateInputOnChange: false,
  });

  const validateRequiredFields = (data: EducationalQualification | ProfessionalQualification, requiredFields: (keyof EducationalQualification | keyof ProfessionalQualification)[]): boolean => {
    // Only validate fields that are in the requiredFields array
    return requiredFields.every(field => {
      const value = 'qualification_type' in data 
        ? data[field as keyof EducationalQualification]
        : data[field as keyof ProfessionalQualification];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });
  };

  const resetEducationalForm = () => {
    setEducationalInput({
      qualification_type: '',
      institution: '',
      board_university: '',
      year_of_passing: '',
      marks_percentage: '',
      grade: '',
      specialization: null,
      medium: '',
      subject: '',
    });
    setEditingEducationalIndex(null);
  };

  const resetProfessionalForm = () => {
    setProfessionalInput({
      exam_name: '',
      institution: '',
      division: null,
      completion_year: '',
      certificate_number: null,
      valid_from: null,
      valid_until: null,
      remarks: null
    });
    setEditingProfessionalIndex(null);
  };

  const handleAddEducational = () => {
    if (!validateRequiredFields(educationalInput, REQUIRED_EDUCATIONAL_FIELDS)) {
      return;
    }

    if (editingEducationalIndex !== null) {
      const updatedList = [...educationalList];
      updatedList[editingEducationalIndex] = educationalInput;
      setEducationalList(updatedList);
    } else {
      setEducationalList([...educationalList, educationalInput]);
    }
    resetEducationalForm();
  };

  const handleAddProfessional = () => {
    if (!validateRequiredFields(professionalInput, REQUIRED_PROFESSIONAL_FIELDS)) {
      return;
    }

    if (editingProfessionalIndex !== null) {
      const updatedList = [...professionalList];
      updatedList[editingProfessionalIndex] = professionalInput;
      setProfessionalList(updatedList);
    } else {
      setProfessionalList([...professionalList, professionalInput]);
    }
    resetProfessionalForm();
  };

  const handleEditEducational = (index: number) => {
    setEditingEducationalIndex(index);
    setEducationalInput(educationalList[index]);
  };

  const handleEditProfessional = (index: number) => {
    setEditingProfessionalIndex(index);
    setProfessionalInput(professionalList[index]);
  };

  const handleDeleteEducational = (index: number) => {
    const updatedList = educationalList.filter((_, i) => i !== index);
    setEducationalList(updatedList);
    resetEducationalForm();
  };

  const handleDeleteProfessional = (index: number) => {
    const updatedList = professionalList.filter((_, i) => i !== index);
    setProfessionalList(updatedList);
    resetProfessionalForm();
  };

  const handleSubmit = (values: EmployeeProfile) => {
    const formData = new FormData();

    // Append basic profile - include all fields even if null
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key as keyof EmployeeProfile]?.toString() || '');
    });

    // Append Educational Qualifications
    educationalList.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`educational_qualifications[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Professional Qualifications
    professionalList.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`professional_qualifications[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Addresses
    addresses.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`addresses[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Documents
    documents.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`documents[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Service Details
    serviceDetails.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`service_details[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Employment Details
    employmentDetails.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`employment_details[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Document Issued
    documentIssued.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`document_issued[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Children
    children.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`children[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Spouses
    spouses.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`spouses[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Nominees
    nominees.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`nominees[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append References
    references.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`references[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Known Languages
    knownLanguages.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`known_languages[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Special Trainings
    specialTrainings.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`special_trainings[${idx}][${key}]`, String(value));
        }
      });
    });

    // Append Curricular Activities
    curricularActivities.forEach((item, idx) => {
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(`curricular_activities[${idx}][${key}]`, String(value));
        }
      });
    });

    // console.log(formData);
    // Submit the form
    axios.post('/data/employees/add', formData)
      .then(response => {
        notifications.show({
          title: 'Success',
          message: 'Employee added successfully',
          color: 'green',
        });
        close();
      })
      .catch(error => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to add employee',
          color: 'red',
        });
      });
  };

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      <Button onClick={open}>Add New Employee</Button>
      <Modal opened={opened} onClose={close} size="100%" title="Add New Employee">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="basic_profile">Basic Profile</Tabs.Tab>
            <Tabs.Tab value="qualification_details">Qualification Details</Tabs.Tab>
            <Tabs.Tab value="address_details">Address Details</Tabs.Tab>
            <Tabs.Tab value="document_details">Document Details</Tabs.Tab>
            <Tabs.Tab value="service_details">Service Details</Tabs.Tab>
            <Tabs.Tab value="employment_details">Employment Details</Tabs.Tab>
            <Tabs.Tab value="document_issued">Document Issued</Tabs.Tab>
            <Tabs.Tab value="other_details">Other Details</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic_profile">
            <form ref={formRef} onSubmit={form.onSubmit(handleSubmit)}>

              <div className="grid grid-cols-4 gap-4">
                <TextInput
                  label="First Name"
                  required
                  {...form.getInputProps('first_name')}
                />
                <TextInput
                  label="Last Name"
                  {...form.getInputProps('last_name')}
                />
                <TextInput
                  label="PF Number"
                  {...form.getInputProps('pf_no')}
                />
                <TextInput
                  label="Date of Birth"
                  type="date"
                  {...form.getInputProps('date_of_birth')}
                />
                <Select
                  label="Gender"
                  required
                  data={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                  {...form.getInputProps('gender')}
                />
                <Select
                  label="Blood Group"
                  data={[
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' },
                  ]}
                  {...form.getInputProps('blood_group')}
                />
                <TextInput
                  label="PAN Number"
                  {...form.getInputProps('pan_no')}
                />
                <TextInput
                  label="Aadhar Number"
                  {...form.getInputProps('aadhar_no')}
                />
                <TextInput
                  label="Guardian Name"
                  {...form.getInputProps('guardian_name')}
                />
                <TextInput
                  label="Contact Number"
                  {...form.getInputProps('contact_no')}
                />
                <TextInput
                  label="Email"
                  type="email"
                  {...form.getInputProps('email')}
                />
                <TextInput
                  label="Country"
                  {...form.getInputProps('country')}
                />
              </div>
            </form>

          </Tabs.Panel>

          <Tabs.Panel value="qualification_details">
            <>
              <EducationalDetails
                educationalList={educationalList}
                educationalInput={educationalInput}
                editingEducationalIndex={editingEducationalIndex}
                onEducationalInputChange={setEducationalInput}
                onAddEducational={handleAddEducational}
                onResetEducationalForm={resetEducationalForm}
                onEditEducational={handleEditEducational}
                onDeleteEducational={handleDeleteEducational}
                validateRequiredFields={validateRequiredFields}
                requiredFields={REQUIRED_EDUCATIONAL_FIELDS}
              />
              <hr className="my-4" />
              <ProfessionalDetails
                professionalList={professionalList}
                professionalInput={professionalInput}
                editingProfessionalIndex={editingProfessionalIndex}
                onProfessionalInputChange={setProfessionalInput}
                onAddProfessional={handleAddProfessional}
                onResetProfessionalForm={resetProfessionalForm}
                onEditProfessional={handleEditProfessional}
                onDeleteProfessional={handleDeleteProfessional}
                validateRequiredFields={validateRequiredFields}
                requiredFields={REQUIRED_PROFESSIONAL_FIELDS}
              />
            </>
          </Tabs.Panel>

          <Tabs.Panel value="address_details">
            <AddressDetails
              addresses={addresses}
              onAddressesChange={setAddresses}
            />
          </Tabs.Panel>

          <Tabs.Panel value="document_details">
            <DocumentSubmitted
              documents={documents}
              onDocumentsChange={setDocuments}
            />
          </Tabs.Panel>

          <Tabs.Panel value="service_details">
            <ServiceDetail
              serviceDetails={serviceDetails}
              onServiceDetailsChange={setServiceDetails}
            />
          </Tabs.Panel>

          <Tabs.Panel value="employment_details">
            <EmploymentDetails
              serviceDetails={employmentDetails}
              onServiceDetailsChange={setEmploymentDetails}
            />
          </Tabs.Panel>

          <Tabs.Panel value="document_issued">
            <DocumentIssued
              documents={documentIssued}
              onDocumentsChange={setDocumentIssued}
            />
          </Tabs.Panel>

          <Tabs.Panel value="other_details">
            <OtherDetails
              spouses={spouses}
              onSpousesChange={setSpouses}
              children={children}
              onChildrenChange={setChildren}
              nominees={nominees}
              onNomineesChange={setNominees}
              references={references}
              onReferencesChange={setReferences}
              knownLanguages={knownLanguages}
              onKnownLanguagesChange={setKnownLanguages}
              specialTrainings={specialTrainings}
              onSpecialTrainingsChange={setSpecialTrainings}
              curricularActivities={curricularActivities}
              onCurricularActivitiesChange={setCurricularActivities}
            />
          </Tabs.Panel>
        </Tabs>
        <Group justify="flex-end" mt="md">
          <Button onClick={handleFormSubmit}>Submit</Button>
        </Group>
      </Modal>
    </>
  );
};

export default AddNew; 