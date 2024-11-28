// import React, { useState } from 'react';
// import { StyleSheet, View } from 'react-native';
// import { Button, Modal, Portal, TextInput, Text } from 'react-native-paper';
// import { useSchedule } from '../context/ScheduleContext';
// import { TimePickerModal } from 'react-native-paper-dates';
// import { de, enGB, registerTranslation } from 'react-native-paper-dates';
// import { Platform } from 'react-native';

// registerTranslation('en-GB', enGB);
// registerTranslation('de', de);

// interface AddClassModalProps {
//     visible: boolean;
//     hideModal: () => void;
//     selectedDay: string;
// }

// const AddClassModal: React.FC<AddClassModalProps> = ({ visible, hideModal, selectedDay }) => {
//     //@ts-ignore
//     const { addClass } = useSchedule();
//     const [courseName, setCourseName] = useState('');
//     const [courseCode, setCourseCode] = useState('');
//     const [lecturer, setLecturer] = useState('');
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [timePickerVisible, setTimePickerVisible] = useState(false);
//     const [isStartTime, setIsStartTime] = useState(true);

//     const handleSubmit = () => {
//         if (courseName && courseCode && lecturer && startTime && endTime) {
//             addClass({
//                 id: Date.now().toString(),
//                 day: selectedDay,
//                 courseName,
//                 courseCode,
//                 lecturer,
//                 startTime,
//                 endTime,
//             });
//             resetForm();
//             hideModal();
//         }
//     };

//     const resetForm = () => {
//         setCourseName('');
//         setCourseCode('');
//         setLecturer('');
//         setStartTime('');
//         setEndTime('');
//     };

//     const onTimeConfirm = ({ hours, minutes }: { hours: number; minutes: number }) => {
//         const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//         if (isStartTime) {
//             setStartTime(time);
//         } else {
//             setEndTime(time);
//         }
//         setTimePickerVisible(false);
//     };

//     return (
//         <Portal>
//             <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.container}>
//                 <Text variant="titleLarge" style={styles.title}>Add New Class</Text>

//                 <TextInput
//                     label="Course Name"
//                     value={courseName}
//                     onChangeText={setCourseName}
//                     style={styles.input}
//                 />

//                 <TextInput
//                     label="Course Code"
//                     value={courseCode}
//                     onChangeText={setCourseCode}
//                     style={styles.input}
//                 />

//                 <TextInput
//                     label="Lecturer"
//                     value={lecturer}
//                     onChangeText={setLecturer}
//                     style={styles.input}
//                 />

//                 <View style={styles.timeContainer}>
//                     <Button
//                         mode="outlined"
//                         onPress={() => {
//                             setIsStartTime(true);
//                             setTimePickerVisible(true);
//                         }}
//                         style={styles.timeButton}
//                     >
//                         {startTime || 'Start Time'}
//                     </Button>

//                     <Button
//                         mode="outlined"
//                         onPress={() => {
//                             setIsStartTime(false);
//                             setTimePickerVisible(true);
//                         }}
//                         style={styles.timeButton}
//                     >
//                         {endTime || 'End Time'}
//                     </Button>
//                 </View>

//                 <View style={styles.actions}>
//                     <Button onPress={hideModal} style={styles.button}>Cancel</Button>
//                     <Button mode="contained" onPress={handleSubmit} style={styles.button}>Add Class</Button>
//                 </View>

//                 <TimePickerModal
//                     visible={timePickerVisible}
//                     onDismiss={() => setTimePickerVisible(false)}
//                     onConfirm={onTimeConfirm}
//                     hours={12}
//                     minutes={0}
//                     locale="en-GB" // Add locale
//                     label="Select time" // Add label
//                     cancelLabel="Cancel"
//                     confirmLabel="Ok"
//                     animationType="fade"
//                     use24HourClock={true}
//                 />
//             </Modal>
//         </Portal>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         backgroundColor: 'white',
//         padding: 20,
//         margin: 20,
//         borderRadius: 8,
//     },
//     title: {
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     input: {
//         marginBottom: 12,
//     },
//     timeContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 20,
//     },
//     timeButton: {
//         flex: 1,
//         marginHorizontal: 5,
//     },
//     actions: {
//         flexDirection: 'row',
//         justifyContent: 'flex-end',
//     },
//     button: {
//         marginLeft: 10,
//     },
// });

// export default AddClassModal;