import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import {
  MD3Theme as Theme,
  useTheme,
  Surface,
  Button,
  Dialog,
  Portal,
  Divider,
  Snackbar,
  IconButton
} from 'react-native-paper';
import { getUserPreferences, saveUserPreferences, UserPreferences } from '../../utils/storage';
import { timetableData, weekDays, TimeTableSlot, departments, years, semesters, sections } from '../../constants/timetable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TimeTablePage = () => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [activeDay, setActiveDay] = useState<string>(weekDays[0]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [daySchedule, setDaySchedule] = useState<TimeTableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [timetableExists, setTimetableExists] = useState(false);

  // Settings dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [department, setDepartment] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [section, setSection] = useState<string>('');
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadUserPreferences();
  }, []);

  useEffect(() => {
    if (userPreferences) {
      loadTimetableData();
    }
  }, [userPreferences, activeDay]);

  useEffect(() => {
    if (year) {
      setAvailableSemesters(semesters[year] || []);
    }
  }, [year]);

  const loadUserPreferences = async () => {
    setLoading(true);
    const prefs = await getUserPreferences();
    setUserPreferences(prefs);

    // Also set the dialog form values
    if (prefs) {
      setDepartment(prefs.department);
      setYear(prefs.year);
      setSemester(prefs.semester);
      setSection(prefs.section);
    }

    setLoading(false);
  };

  const loadTimetableData = () => {
    if (!userPreferences) return;

    const { department, year, semester, section } = userPreferences;

    try {
      const schedule = timetableData[department]?.[year]?.[semester]?.[section]?.[activeDay];
      if (schedule) {
        setDaySchedule(schedule);
        setTimetableExists(true);
      } else {
        setDaySchedule([]);
        setTimetableExists(false);
      }
    } catch (error) {
      console.error('Error loading timetable:', error);
      setDaySchedule([]);
      setTimetableExists(false);
    }
  };

  const openSettingsDialog = () => {
    setDialogVisible(true);
  };

  const handleSavePreferences = async () => {
    if (!department || !year || !semester || !section) {
      setSnackbarMessage('Please select all preferences');
      setSnackbarVisible(true);
      return;
    }

    const preferences: UserPreferences = {
      department,
      year,
      semester,
      section
    };

    const success = await saveUserPreferences(preferences);

    if (success) {
      setUserPreferences(preferences);
      setDialogVisible(false);
      setSnackbarMessage('Preferences saved successfully');
    } else {
      setSnackbarMessage('Failed to save preferences');
    }

    setSnackbarVisible(true);
  };

  const renderNoPreferencesView = () => (
    <View style={styles.comingSoonContainer}>
      <Text style={styles.comingSoonTitle}>No Preferences Set</Text>
      <Text style={styles.comingSoonText}>
        Please configure your department, year, semester, and section to see your timetable.
      </Text>
      <Button
        mode="contained"
        onPress={openSettingsDialog}
        style={styles.settingsButton}
      >
        Configure Preferences
      </Button>
    </View>
  );

  const renderNoTimetableView = () => (
    <View style={styles.comingSoonContainer}>
      <Text style={styles.comingSoonTitle}>No Timetable Found</Text>
      <Text style={styles.comingSoonText}>
        We couldn't find a timetable for {userPreferences?.department} Year {userPreferences?.year}, Semester {userPreferences?.semester}, Section {userPreferences?.section}.
      </Text>
      <Button
        mode="contained"
        onPress={openSettingsDialog}
        style={styles.settingsButton}
      >
        Change Preferences
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.headerContainer} elevation={4}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Time Table</Text>
            <IconButton
              icon="cog"
              size={24}
              onPress={openSettingsDialog}
              iconColor={theme.colors.primary}
            />
          </View>
          {userPreferences ? (
            <Text style={styles.headerSubtitle}>
              {userPreferences.department} - Year {userPreferences.year}, Sem {userPreferences.semester}, Section {userPreferences.section}
            </Text>
          ) : (
            <Text style={styles.headerSubtitle}>Configure your timetable preferences</Text>
          )}
        </View>

        {userPreferences && timetableExists && (
          <View style={styles.daysContainer}>
            {weekDays.map((day) => (
              <Pressable
                key={day}
                onPress={() => setActiveDay(day)}
                style={[
                  styles.dayTab,
                  activeDay === day ? styles.activeDay : styles.inactiveDay
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    activeDay === day ? styles.activeDayText : styles.inactiveDayText
                  ]}
                >
                  {day.slice(0, 3)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Surface>

      {loading ? (
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonText}>Loading...</Text>
        </View>
      ) : !userPreferences ? (
        renderNoPreferencesView()
      ) : !timetableExists ? (
        renderNoTimetableView()
      ) : (
        <View style={styles.tableWrapper}>
          <ScrollView style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.tableContent}>
                <View style={styles.headerRow}>
                  <Text style={[styles.cell, styles.headerCell, styles.timeCell]}>Time</Text>
                  <Text style={[styles.cell, styles.headerCell, styles.subjectCell]}>Subject</Text>
                  <Text style={[styles.cell, styles.headerCell, styles.codeCell]}>Course Code</Text>
                  <Text style={[styles.cell, styles.headerCell, styles.teacherCell]}>Teacher</Text>
                </View>

                {daySchedule.map((slot, index) => (
                  <View key={index} style={[
                    styles.row,
                    slot.subject.includes('Break') ? styles.breakRow : null
                  ]}>
                    <Text style={[styles.cell, styles.timeCell]}>{slot.time}</Text>
                    <Text style={[styles.cell, styles.subjectCell]}>{slot.subject}</Text>
                    <Text style={[styles.cell, styles.codeCell]}>{slot.courseCode}</Text>
                    <Text style={[styles.cell, styles.teacherCell]}>{slot.teacher}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </ScrollView>
        </View>
      )}

      {/* Settings Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>Timetable Preferences</Text>
          </View>

          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView style={styles.dialogScrollView}>
              <View style={styles.preferencesSection}>
                <Text style={styles.sectionTitle}>Department</Text>
                <View style={styles.optionsGrid}>
                  {departments.map(dept => (
                    <Pressable
                      key={dept}
                      onPress={() => setDepartment(dept)}
                      style={[
                        styles.optionCard,
                        department === dept && styles.selectedOptionCard
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          department === dept && styles.selectedOptionText
                        ]}
                      >
                        {dept}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.preferencesSection}>
                <Text style={styles.sectionTitle}>Year</Text>
                <View style={styles.optionsGrid}>
                  {years.map(yr => (
                    <Pressable
                      key={yr}
                      onPress={() => setYear(yr)}
                      style={[
                        styles.optionCard,
                        year === yr && styles.selectedOptionCard
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          year === yr && styles.selectedOptionText
                        ]}
                      >
                        Year {yr}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.preferencesSection}>
                <Text style={styles.sectionTitle}>Semester</Text>
                <View style={styles.optionsGrid}>
                  {availableSemesters.map(sem => (
                    <Pressable
                      key={sem}
                      onPress={() => setSemester(sem)}
                      disabled={!year}
                      style={[
                        styles.optionCard,
                        !year && styles.disabledCard,
                        semester === sem && styles.selectedOptionCard
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          !year && styles.disabledText,
                          semester === sem && styles.selectedOptionText
                        ]}
                      >
                        Sem {sem}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.preferencesSection}>
                <Text style={styles.sectionTitle}>Section</Text>
                <View style={styles.optionsGrid}>
                  {sections.map(sec => (
                    <Pressable
                      key={sec}
                      onPress={() => setSection(sec)}
                      style={[
                        styles.optionCard,
                        section === sec && styles.selectedOptionCard
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          section === sec && styles.selectedOptionText
                        ]}
                      >
                        Sec {sec}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>

          <View style={styles.dialogFooter}>
            <Button
              onPress={() => setDialogVisible(false)}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSavePreferences}
              mode="contained"
              style={styles.saveButton}
            >
              Save
            </Button>
          </View>
        </Dialog>
      </Portal>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    backgroundColor: theme.colors.surface,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    elevation: 4,
  },
  headerContent: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  daysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  dayTab: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDay: {
    backgroundColor: theme.colors.primaryContainer,
    elevation: 2,
  },
  inactiveDay: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  dayText: {
    fontWeight: '600',
    fontSize: 14,
  },
  activeDayText: {
    color: theme.colors.onPrimaryContainer,
  },
  inactiveDayText: {
    color: theme.colors.onSurfaceVariant,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    marginBottom: 24,
  },
  tableWrapper: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  tableContainer: {
    flex: 1,
  },
  tableContent: {
    marginTop: 8,
    paddingBottom: 24, // Add padding at the bottom for better scrolling
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceVariant,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
  },
  breakRow: {
    backgroundColor: theme.colors.primaryContainer,
  },
  headerCell: {
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
    backgroundColor: theme.colors.primaryContainer,
  },
  cell: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: 12,
    color: theme.colors.onSurface,
  },
  timeCell: {
    width: 100,
  },
  subjectCell: {
    width: 180,
  },
  codeCell: {
    width: 120,
  },
  teacherCell: {
    width: 150,
  },
  settingsButton: {
    marginTop: 16,
  },
  dialog: {
    borderRadius: 28,
    backgroundColor: theme.colors.background,
    elevation: 24,
    margin: 20,
    overflow: 'hidden', // Ensure borders are respected
    maxWidth: 560,
    alignSelf: 'center',
  },
  dialogHeader: {
    backgroundColor: theme.colors.primaryContainer,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.onPrimaryContainer,
  },
  dialogScrollArea: {
    paddingHorizontal: 0,
    maxHeight: 460,
  },
  dialogScrollView: {
    paddingVertical: 0,
  },
  preferencesSection: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.onSurface,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  optionCard: {
    margin: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedOptionCard: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primary,
    elevation: 2,
  },
  disabledCard: {
    backgroundColor: theme.colors.surfaceDisabled,
    opacity: 0.6,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.onSurfaceVariant,
  },
  selectedOptionText: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: '700',
  },
  disabledText: {
    color: theme.colors.onSurfaceDisabled,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  cancelButton: {
    marginRight: 12,
  },
  cancelButtonLabel: {
    color: theme.colors.error,
  },
  saveButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
  },
});

export default TimeTablePage;