import { useState } from 'react';
import { Button, TextInput, Textarea, Select } from '@mantine/core';

interface Spouse {
    spouse_name: string | null;
    spouse_dob: string | null;
    spouse_telephone: string | null;
    spouse_qualification: string | null;
    marriage_date: string | null;
    spouse_job_details: string | null;
    mother_tongue: 'hindi' | 'english' | 'assamese' | 'bengali' | 'other' | null;
    religion: 'hindu' | 'muslim' | 'christian' | 'jain' | 'buddhist' | 'other' | null;
}

interface Child {
    name: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
}

interface Nominee {
    nominee_name: string | null;
    nominee_relationship: 'father' | 'mother' | 'brother' | 'sister' | 'son' | 'daughter' | 'husband' | 'wife' | 'other' | null;
    nominee_dob: string | null;
    share_percentage: number | null;
}

interface Reference {
    reference_name: string | null;
    designation: string | null;
    reference_address: string | null;
}

interface KnownLanguage {
    language_name: string | null;
    speak: boolean | null;
    read: boolean | null;
    write: boolean | null;
    priority: number;
}

interface SpecialTraining {
    training_name: string | null;
    training_place: string | null;
    organized_by: string | null;
    training_start_date: string | null;
    training_end_date: string | null;
}

interface CurricularActivity {
    event_name: string | null;
    discipline: string | null;
    prize_awarded: string | null;
    event_year: string | null;
}

interface OtherDetailsProps {
    spouses: Spouse[];
    onSpousesChange: (spouses: Spouse[]) => void;
    children: Child[];
    onChildrenChange: (children: Child[]) => void;
    nominees: Nominee[];
    onNomineesChange: (nominees: Nominee[]) => void;
    references: Reference[];
    onReferencesChange: (references: Reference[]) => void;
    knownLanguages: KnownLanguage[];
    onKnownLanguagesChange: (languages: KnownLanguage[]) => void;
    specialTrainings: SpecialTraining[];
    onSpecialTrainingsChange: (trainings: SpecialTraining[]) => void;
    curricularActivities: CurricularActivity[];
    onCurricularActivitiesChange: (activities: CurricularActivity[]) => void;
}

const OtherDetails = ({
    spouses,
    onSpousesChange,
    children,
    onChildrenChange,
    nominees,
    onNomineesChange,
    references,
    onReferencesChange,
    knownLanguages,
    onKnownLanguagesChange,
    specialTrainings,
    onSpecialTrainingsChange,
    curricularActivities,
    onCurricularActivitiesChange,
}: OtherDetailsProps) => {
    const [activeTab, setActiveTab] = useState<'spouse' | 'children' | 'nominee' | 'reference' | 'language' | 'training' | 'activity'>('spouse');

    // Spouse state and handlers
    const [spouseInfo, setSpouseInfo] = useState<Spouse>({
        spouse_name: '',
        spouse_dob: '',
        spouse_telephone: '',
        spouse_qualification: '',
        marriage_date: '',
        spouse_job_details: '',
        mother_tongue: null,
        religion: null,
    });
    const [editingSpouseIndex, setEditingSpouseIndex] = useState<number | null>(null);

    // Child state and handlers
    const [childInfo, setChildInfo] = useState<Child>({
        name: '',
        date_of_birth: '',
        gender: 'other',
    });
    const [editingChildIndex, setEditingChildIndex] = useState<number | null>(null);

    // Nominee state and handlers
    const [nomineeInfo, setNomineeInfo] = useState<Nominee>({
        nominee_name: '',
        nominee_relationship: null,
        nominee_dob: '',
        share_percentage: null,
    });
    const [editingNomineeIndex, setEditingNomineeIndex] = useState<number | null>(null);

    // Reference state and handlers
    const [referenceInfo, setReferenceInfo] = useState<Reference>({
        reference_name: '',
        designation: '',
        reference_address: '',
    });
    const [editingReferenceIndex, setEditingReferenceIndex] = useState<number | null>(null);

    // Language state and handlers
    const [languageInfo, setLanguageInfo] = useState<KnownLanguage>({
        language_name: '',
        speak: false,
        read: false,
        write: false,
        priority: 1,
    });
    const [editingLanguageIndex, setEditingLanguageIndex] = useState<number | null>(null);

    // Training state and handlers
    const [trainingInfo, setTrainingInfo] = useState<SpecialTraining>({
        training_name: '',
        training_place: '',
        organized_by: '',
        training_start_date: '',
        training_end_date: '',
    });
    const [editingTrainingIndex, setEditingTrainingIndex] = useState<number | null>(null);

    // Activity state and handlers
    const [activityInfo, setActivityInfo] = useState<CurricularActivity>({
        event_name: '',
        discipline: '',
        prize_awarded: '',
        event_year: '',
    });
    const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);

    const resetForm = () => {
        switch (activeTab) {
            case 'spouse':
                setSpouseInfo({
                    spouse_name: '',
                    spouse_dob: '',
                    spouse_telephone: '',
                    spouse_qualification: '',
                    marriage_date: '',
                    spouse_job_details: '',
                    mother_tongue: null,
                    religion: null,
                });
                setEditingSpouseIndex(null);
                break;
            case 'children':
                setChildInfo({
                    name: '',
                    date_of_birth: '',
                    gender: 'other',
                });
                setEditingChildIndex(null);
                break;
            case 'nominee':
                setNomineeInfo({
                    nominee_name: '',
                    nominee_relationship: null,
                    nominee_dob: '',
                    share_percentage: null,
                });
                setEditingNomineeIndex(null);
                break;
            case 'reference':
                setReferenceInfo({
                    reference_name: '',
                    designation: '',
                    reference_address: '',
                });
                setEditingReferenceIndex(null);
                break;
            case 'language':
                setLanguageInfo({
                    language_name: '',
                    speak: false,
                    read: false,
                    write: false,
                    priority: 1,
                });
                setEditingLanguageIndex(null);
                break;
            case 'training':
                setTrainingInfo({
                    training_name: '',
                    training_place: '',
                    organized_by: '',
                    training_start_date: '',
                    training_end_date: '',
                });
                setEditingTrainingIndex(null);
                break;
            case 'activity':
                setActivityInfo({
                    event_name: '',
                    discipline: '',
                    prize_awarded: '',
                    event_year: '',
                });
                setEditingActivityIndex(null);
                break;
        }
    };

    const handleSubmit = () => {
        switch (activeTab) {
            case 'spouse':
                if (editingSpouseIndex !== null) {
                    const updatedSpouses = [...spouses];
                    updatedSpouses[editingSpouseIndex] = spouseInfo;
                    onSpousesChange(updatedSpouses);
                } else {
                    onSpousesChange([...spouses, spouseInfo]);
                }
                break;
            case 'children':
                if (editingChildIndex !== null) {
                    const updatedChildren = [...children];
                    updatedChildren[editingChildIndex] = childInfo;
                    onChildrenChange(updatedChildren);
                } else {
                    onChildrenChange([...children, childInfo]);
                }
                break;
            case 'nominee':
                if (editingNomineeIndex !== null) {
                    const updatedNominees = [...nominees];
                    updatedNominees[editingNomineeIndex] = nomineeInfo;
                    onNomineesChange(updatedNominees);
                } else {
                    onNomineesChange([...nominees, nomineeInfo]);
                }
                break;
            case 'reference':
                if (editingReferenceIndex !== null) {
                    const updatedReferences = [...references];
                    updatedReferences[editingReferenceIndex] = referenceInfo;
                    onReferencesChange(updatedReferences);
                } else {
                    onReferencesChange([...references, referenceInfo]);
                }
                break;
            case 'language':
                if (editingLanguageIndex !== null) {
                    const updatedLanguages = [...knownLanguages];
                    updatedLanguages[editingLanguageIndex] = languageInfo;
                    onKnownLanguagesChange(updatedLanguages);
                } else {
                    onKnownLanguagesChange([...knownLanguages, languageInfo]);
                }
                break;
            case 'training':
                if (editingTrainingIndex !== null) {
                    const updatedTrainings = [...specialTrainings];
                    updatedTrainings[editingTrainingIndex] = trainingInfo;
                    onSpecialTrainingsChange(updatedTrainings);
                } else {
                    onSpecialTrainingsChange([...specialTrainings, trainingInfo]);
                }
                break;
            case 'activity':
                if (editingActivityIndex !== null) {
                    const updatedActivities = [...curricularActivities];
                    updatedActivities[editingActivityIndex] = activityInfo;
                    onCurricularActivitiesChange(updatedActivities);
                } else {
                    onCurricularActivitiesChange([...curricularActivities, activityInfo]);
                }
                break;
        }
        resetForm();
    };

    const handleEdit = (index: number) => {
        switch (activeTab) {
            case 'spouse':
                setEditingSpouseIndex(index);
                setSpouseInfo(spouses[index]);
                break;
            case 'children':
                setEditingChildIndex(index);
                setChildInfo(children[index]);
                break;
            case 'nominee':
                setEditingNomineeIndex(index);
                setNomineeInfo(nominees[index]);
                break;
            case 'reference':
                setEditingReferenceIndex(index);
                setReferenceInfo(references[index]);
                break;
            case 'language':
                setEditingLanguageIndex(index);
                setLanguageInfo(knownLanguages[index]);
                break;
            case 'training':
                setEditingTrainingIndex(index);
                setTrainingInfo(specialTrainings[index]);
                break;
            case 'activity':
                setEditingActivityIndex(index);
                setActivityInfo(curricularActivities[index]);
                break;
        }
    };

    const handleDelete = (index: number) => {
        switch (activeTab) {
            case 'spouse':
                const updatedSpouses = spouses.filter((_, i) => i !== index);
                onSpousesChange(updatedSpouses);
                break;
            case 'children':
                const updatedChildren = children.filter((_, i) => i !== index);
                onChildrenChange(updatedChildren);
                break;
            case 'nominee':
                const updatedNominees = nominees.filter((_, i) => i !== index);
                onNomineesChange(updatedNominees);
                break;
            case 'reference':
                const updatedReferences = references.filter((_, i) => i !== index);
                onReferencesChange(updatedReferences);
                break;
            case 'language':
                const updatedLanguages = knownLanguages.filter((_, i) => i !== index);
                onKnownLanguagesChange(updatedLanguages);
                break;
            case 'training':
                const updatedTrainings = specialTrainings.filter((_, i) => i !== index);
                onSpecialTrainingsChange(updatedTrainings);
                break;
            case 'activity':
                const updatedActivities = curricularActivities.filter((_, i) => i !== index);
                onCurricularActivitiesChange(updatedActivities);
                break;
        }
        resetForm();
    };

    const renderForm = () => {
        switch (activeTab) {
            case 'spouse':
                return (
                    <div className="grid grid-cols-4 gap-4">
                        <TextInput 
                            label="Spouse Name" 
                            value={spouseInfo.spouse_name || ''} 
                            onChange={(e) => setSpouseInfo({ ...spouseInfo, spouse_name: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Date of Birth" 
                            type="date"
                            value={spouseInfo.spouse_dob || ''} 
                            onChange={(e) => setSpouseInfo({ ...spouseInfo, spouse_dob: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Contact Number" 
                            value={spouseInfo.spouse_telephone || ''} 
                            onChange={(e) => setSpouseInfo({ ...spouseInfo, spouse_telephone: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Qualification" 
                            value={spouseInfo.spouse_qualification || ''} 
                            onChange={(e) => setSpouseInfo({ ...spouseInfo, spouse_qualification: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Marriage Date" 
                            type="date"
                            value={spouseInfo.marriage_date || ''} 
                            onChange={(e) => setSpouseInfo({ ...spouseInfo, marriage_date: e.target.value })}
                            required 
                        />
                        <div className="col-span-2">
                            <Textarea 
                                label="Job Details" 
                                value={spouseInfo.spouse_job_details || ''} 
                                onChange={(e) => setSpouseInfo({ ...spouseInfo, spouse_job_details: e.target.value })}
                                minRows={2}
                            />
                        </div>
                    </div>
                );
            case 'children':
                return (
                    <div className="grid grid-cols-4 gap-4">
                        <TextInput 
                            label="Child Name" 
                            value={childInfo.name} 
                            onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Date of Birth" 
                            type="date"
                            value={childInfo.date_of_birth} 
                            onChange={(e) => setChildInfo({ ...childInfo, date_of_birth: e.target.value })}
                            required 
                        />
                        <Select
                            label="Gender"
                            value={childInfo.gender}
                            onChange={(value) => setChildInfo({ ...childInfo, gender: value as Child['gender'] })}
                            data={[
                                { value: 'male', label: 'Male' },
                                { value: 'female', label: 'Female' },
                                { value: 'other', label: 'Other' },
                            ]}
                            required
                        />
                    </div>
                );
            case 'nominee':
                return (
                    <div className="grid grid-cols-4 gap-4">
                        <TextInput 
                            label="Nominee Name" 
                            value={nomineeInfo.nominee_name || ''} 
                            onChange={(e) => setNomineeInfo({ ...nomineeInfo, nominee_name: e.target.value })}
                            required 
                        />
                        <Select
                            label="Relationship"
                            value={nomineeInfo.nominee_relationship || ''}
                            onChange={(value) => setNomineeInfo({ ...nomineeInfo, nominee_relationship: value as Nominee['nominee_relationship'] })}
                            data={[
                                { value: 'father', label: 'Father' },
                                { value: 'mother', label: 'Mother' },
                                { value: 'brother', label: 'Brother' },
                                { value: 'sister', label: 'Sister' },
                                { value: 'son', label: 'Son' },
                                { value: 'daughter', label: 'Daughter' },
                                { value: 'husband', label: 'Husband' },
                                { value: 'wife', label: 'Wife' },
                                { value: 'other', label: 'Other' },
                            ]}
                            required
                        />
                        <TextInput 
                            label="Date of Birth" 
                            type="date"
                            value={nomineeInfo.nominee_dob || ''} 
                            onChange={(e) => setNomineeInfo({ ...nomineeInfo, nominee_dob: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Share Percentage" 
                            type="number"
                            value={nomineeInfo.share_percentage || ''} 
                            onChange={(e) => setNomineeInfo({ ...nomineeInfo, share_percentage: Number(e.target.value) })}
                            required 
                        />
                    </div>
                );
            case 'reference':
                return (
                    <div className="grid grid-cols-4 gap-4">
                        <TextInput 
                            label="Reference Name" 
                            value={referenceInfo.reference_name || ''} 
                            onChange={(e) => setReferenceInfo({ ...referenceInfo, reference_name: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Designation" 
                            value={referenceInfo.designation || ''} 
                            onChange={(e) => setReferenceInfo({ ...referenceInfo, designation: e.target.value })}
                            required 
                        />
                        <div className="col-span-2">
                            <Textarea 
                                label="Address" 
                                value={referenceInfo.reference_address || ''} 
                                onChange={(e) => setReferenceInfo({ ...referenceInfo, reference_address: e.target.value })}
                                minRows={2}
                                required 
                            />
                        </div>
                    </div>
                );
            case 'language':
                return (
                    <div className="grid grid-cols-4 gap-4">
                        <TextInput 
                            label="Language Name" 
                            value={languageInfo.language_name || ''} 
                            onChange={(e) => setLanguageInfo({ ...languageInfo, language_name: e.target.value })}
                            required 
                        />
                        <div className="col-span-2">
                            <div className="flex gap-4">
                                <Select
                                    label="Can Speak"
                                    value={languageInfo.speak ? 'yes' : 'no'}
                                    onChange={(value) => setLanguageInfo({ ...languageInfo, speak: value === 'yes' })}
                                    data={[
                                        { value: 'yes', label: 'Yes' },
                                        { value: 'no', label: 'No' },
                                    ]}
                                    required
                                />
                                <Select
                                    label="Can Read"
                                    value={languageInfo.read ? 'yes' : 'no'}
                                    onChange={(value) => setLanguageInfo({ ...languageInfo, read: value === 'yes' })}
                                    data={[
                                        { value: 'yes', label: 'Yes' },
                                        { value: 'no', label: 'No' },
                                    ]}
                                    required
                                />
                                <Select
                                    label="Can Write"
                                    value={languageInfo.write ? 'yes' : 'no'}
                                    onChange={(value) => setLanguageInfo({ ...languageInfo, write: value === 'yes' })}
                                    data={[
                                        { value: 'yes', label: 'Yes' },
                                        { value: 'no', label: 'No' },
                                    ]}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'training':
                return (
                    <div className="grid grid-cols-4 gap-4">
                        <TextInput 
                            label="Training Name" 
                            value={trainingInfo.training_name || ''} 
                            onChange={(e) => setTrainingInfo({ ...trainingInfo, training_name: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Training Place" 
                            value={trainingInfo.training_place || ''} 
                            onChange={(e) => setTrainingInfo({ ...trainingInfo, training_place: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Organized By" 
                            value={trainingInfo.organized_by || ''} 
                            onChange={(e) => setTrainingInfo({ ...trainingInfo, organized_by: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Start Date" 
                            type="date"
                            value={trainingInfo.training_start_date || ''} 
                            onChange={(e) => setTrainingInfo({ ...trainingInfo, training_start_date: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="End Date" 
                            type="date"
                            value={trainingInfo.training_end_date || ''} 
                            onChange={(e) => setTrainingInfo({ ...trainingInfo, training_end_date: e.target.value })}
                            required 
                        />
                    </div>
                );
            case 'activity':
                return (
                    <div className="grid grid-cols-4 gap-4">
                        <TextInput 
                            label="Event Name" 
                            value={activityInfo.event_name || ''} 
                            onChange={(e) => setActivityInfo({ ...activityInfo, event_name: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Discipline" 
                            value={activityInfo.discipline || ''} 
                            onChange={(e) => setActivityInfo({ ...activityInfo, discipline: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Prize Awarded" 
                            value={activityInfo.prize_awarded || ''} 
                            onChange={(e) => setActivityInfo({ ...activityInfo, prize_awarded: e.target.value })}
                            required 
                        />
                        <TextInput 
                            label="Event Year" 
                            value={activityInfo.event_year || ''} 
                            onChange={(e) => setActivityInfo({ ...activityInfo, event_year: e.target.value })}
                            required 
                        />
                    </div>
                );
        }
    };

    const renderTable = () => {
        switch (activeTab) {
            case 'spouse':
                return (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Date of Birth</th>
                                <th className="px-4 py-2">Contact Number</th>
                                <th className="px-4 py-2">Qualification</th>
                                <th className="px-4 py-2">Marriage Date</th>
                                <th className="px-4 py-2">Job Details</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spouses.map((spouse, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{spouse.spouse_name}</td>
                                    <td className="px-4 py-2">{spouse.spouse_dob}</td>
                                    <td className="px-4 py-2">{spouse.spouse_telephone}</td>
                                    <td className="px-4 py-2">{spouse.spouse_qualification}</td>
                                    <td className="px-4 py-2">{spouse.marriage_date}</td>
                                    <td className="px-4 py-2">{spouse.spouse_job_details}</td>
                                    <td className="px-4 py-2">
                                        <Button size="xs" variant="subtle" color="blue" onClick={() => handleEdit(index)}>Edit</Button>
                                        <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(index)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'children':
                return (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Date of Birth</th>
                                <th className="px-4 py-2">Gender</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {children.map((child, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{child.name}</td>
                                    <td className="px-4 py-2">{child.date_of_birth}</td>
                                    <td className="px-4 py-2">{child.gender}</td>
                                    <td className="px-4 py-2">
                                        <Button size="xs" variant="subtle" color="blue" onClick={() => handleEdit(index)}>Edit</Button>
                                        <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(index)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'nominee':
                return (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Relationship</th>
                                <th className="px-4 py-2">Date of Birth</th>
                                <th className="px-4 py-2">Share Percentage</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nominees.map((nominee, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{nominee.nominee_name}</td>
                                    <td className="px-4 py-2">{nominee.nominee_relationship}</td>
                                    <td className="px-4 py-2">{nominee.nominee_dob}</td>
                                    <td className="px-4 py-2">{nominee.share_percentage}</td>
                                    <td className="px-4 py-2">
                                        <Button size="xs" variant="subtle" color="blue" onClick={() => handleEdit(index)}>Edit</Button>
                                        <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(index)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'reference':
                return (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Designation</th>
                                <th className="px-4 py-2">Address</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {references.map((reference, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{reference.reference_name}</td>
                                    <td className="px-4 py-2">{reference.designation}</td>
                                    <td className="px-4 py-2">{reference.reference_address}</td>
                                    <td className="px-4 py-2">
                                        <Button size="xs" variant="subtle" color="blue" onClick={() => handleEdit(index)}>Edit</Button>
                                        <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(index)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'language':
                return (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Language Name</th>
                                <th className="px-4 py-2">Can Speak</th>
                                <th className="px-4 py-2">Can Read</th>
                                <th className="px-4 py-2">Can Write</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {knownLanguages.map((language, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{language.language_name}</td>
                                    <td className="px-4 py-2">{language.speak ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-2">{language.read ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-2">{language.write ? 'Yes' : 'No'}</td>
                                    <td className="px-4 py-2">
                                        <Button size="xs" variant="subtle" color="blue" onClick={() => handleEdit(index)}>Edit</Button>
                                        <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(index)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'training':
                return (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Training Name</th>
                                <th className="px-4 py-2">Training Place</th>
                                <th className="px-4 py-2">Organized By</th>
                                <th className="px-4 py-2">Start Date</th>
                                <th className="px-4 py-2">End Date</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {specialTrainings.map((training, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{training.training_name}</td>
                                    <td className="px-4 py-2">{training.training_place}</td>
                                    <td className="px-4 py-2">{training.organized_by}</td>
                                    <td className="px-4 py-2">{training.training_start_date}</td>
                                    <td className="px-4 py-2">{training.training_end_date}</td>
                                    <td className="px-4 py-2">
                                        <Button size="xs" variant="subtle" color="blue" onClick={() => handleEdit(index)}>Edit</Button>
                                        <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(index)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'activity':
                return (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="px-4 py-2">Event Name</th>
                                <th className="px-4 py-2">Discipline</th>
                                <th className="px-4 py-2">Prize Awarded</th>
                                <th className="px-4 py-2">Event Year</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {curricularActivities.map((activity, index) => (
                                <tr key={index} className="border-b text-sm">
                                    <td className="px-4 py-2">{activity.event_name}</td>
                                    <td className="px-4 py-2">{activity.discipline}</td>
                                    <td className="px-4 py-2">{activity.prize_awarded}</td>
                                    <td className="px-4 py-2">{activity.event_year}</td>
                                    <td className="px-4 py-2">
                                        <Button size="xs" variant="subtle" color="blue" onClick={() => handleEdit(index)}>Edit</Button>
                                        <Button size="xs" variant="subtle" color="red" onClick={() => handleDelete(index)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg shadow-md p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Other Details</h3>
                    <div className="flex gap-2">
                        <Button
                            variant={activeTab === 'spouse' ? 'filled' : 'outline'}
                            onClick={() => setActiveTab('spouse')}
                        >
                            Spouse
                        </Button>
                        <Button
                            variant={activeTab === 'children' ? 'filled' : 'outline'}
                            onClick={() => setActiveTab('children')}
                        >
                            Children
                        </Button>
                        <Button
                            variant={activeTab === 'nominee' ? 'filled' : 'outline'}
                            onClick={() => setActiveTab('nominee')}
                        >
                            Nominee
                        </Button>
                        <Button
                            variant={activeTab === 'reference' ? 'filled' : 'outline'}
                            onClick={() => setActiveTab('reference')}
                        >
                            Reference
                        </Button>
                        <Button
                            variant={activeTab === 'language' ? 'filled' : 'outline'}
                            onClick={() => setActiveTab('language')}
                        >
                            Language
                        </Button>
                        <Button
                            variant={activeTab === 'training' ? 'filled' : 'outline'}
                            onClick={() => setActiveTab('training')}
                        >
                            Training
                        </Button>
                        <Button
                            variant={activeTab === 'activity' ? 'filled' : 'outline'}
                            onClick={() => setActiveTab('activity')}
                        >
                            Activity
                        </Button>
                    </div>
                </div>
                <div className="mb-4">
                    {renderForm()}
                </div>
                <div className="flex justify-end space-x-4">
                    <Button variant="subtle" color="gray" onClick={resetForm}>Clear</Button>
                    <Button onClick={handleSubmit}>
                        {activeTab === 'spouse' && (editingSpouseIndex !== null ? 'Update Spouse' : 'Add Spouse')}
                        {activeTab === 'children' && (editingChildIndex !== null ? 'Update Child' : 'Add Child')}
                        {activeTab === 'nominee' && (editingNomineeIndex !== null ? 'Update Nominee' : 'Add Nominee')}
                        {activeTab === 'reference' && (editingReferenceIndex !== null ? 'Update Reference' : 'Add Reference')}
                        {activeTab === 'language' && (editingLanguageIndex !== null ? 'Update Language' : 'Add Language')}
                        {activeTab === 'training' && (editingTrainingIndex !== null ? 'Update Training' : 'Add Training')}
                        {activeTab === 'activity' && (editingActivityIndex !== null ? 'Update Activity' : 'Add Activity')}
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border overflow-x-auto">
                {renderTable()}
            </div>
        </div>
    );
};

export default OtherDetails; 