import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem, TouchableOpacity, Modal, ScrollView, Linking } from 'react-native';
import { useTheme, Text, Searchbar, ActivityIndicator, Surface, Chip, MD3Theme as Theme, Button, Card, Divider, RadioButton } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface Resource {
    id: string;
    name: string;
    course: string;
    description: string;
    department: string;
    year: number;
    academicYear: string;
    professorName: string;
    cid: string | null;
    externalLinks: string[];
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Resource>);

const ResourcesScreen: React.FC = () => {
    const theme = useTheme();
    const styles = createStyles(theme);

    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState({
        department: 'all',
        year: 'all',
        professor: 'all',
        course: 'all'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        department: 'all',
        year: 'all',
        professor: 'all',
        course: 'all'
    });
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [loadingResourceId, setLoadingResourceId] = useState<string | null>(null);

    const createSignedURL = async (cid: string, resourceId: string) => {
        try {
            setLoadingResourceId(resourceId);

            const response = await fetch(`https://labwise-web.vercel.app/api/pinata/signed-url?cid=${cid}`);

            if (!response.ok) {
                throw new Error(`Failed to get signed URL: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.url) {
                await Linking.openURL(data.url);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Failed to open resource:', error);
        } finally {
            setLoadingResourceId(null);
        }
    };

    const uniqueValues = {
        departments: ['all', ...Array.from(new Set(resources.map(r => r.department)))],
        years: ['all', ...Array.from(new Set(resources.map(r => r.year?.toString() || '')))],
        professors: ['all', ...Array.from(new Set(resources.map(r => r.professorName || 'Unknown')))],
        courses: ['all', ...Array.from(new Set(resources.map(r => r.course || 'Uncategorized')))],
    };

    const fetchResources = async () => {
        try {
            setLoading(true);
            const url = filters.department === 'all'
                ? 'https://labwise-web.vercel.app/api/resources'
                : `https://labwise-web.vercel.app/api/resources?department=${filters.department}`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setResources(data.resources);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchResources();
    }, []);

    useEffect(() => {
        fetchResources();
    }, [filters.department]);

    // Filter resources based on selected filters and search query
    const filteredResources = resources.filter(resource => {
        const matchesSearch = searchQuery === '' ||
            resource.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (resource.description || '')?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilters =
            (filters.department === 'all' || resource.department === filters.department) &&
            (filters.year === 'all' || resource.year?.toString() === filters.year) &&
            (filters.professor === 'all' || resource.professorName === filters.professor) &&
            (filters.course === 'all' || resource.course === filters.course);

        return matchesSearch && matchesFilters;
    });

    const openFilterModal = () => {
        setTempFilters({ ...filters });
        setShowFilterModal(true);
    };

    const applyFilters = () => {
        setFilters({ ...tempFilters });
        setShowFilterModal(false);
    };

    const resetFilters = () => {
        const resetValues = {
            department: 'all',
            year: 'all',
            professor: 'all',
            course: 'all'
        };
        setTempFilters(resetValues);
        setFilters(resetValues);
        setShowFilterModal(false);
    };

    // Get filtered professors based on selected department
    const getFilteredProfessors = useCallback(() => {
        if (tempFilters.department === 'all') {
            return uniqueValues.professors;
        } else {
            const deptProfessors = ['all', ...Array.from(new Set(
                resources
                    .filter(r => r.department === tempFilters.department)
                    .map(r => r.professorName)
                    .filter(Boolean)
            ))];
            return deptProfessors;
        }
    }, [resources, tempFilters.department]);

    // Get filtered courses based on selected department and professor
    const getFilteredCourses = useCallback(() => {
        let filteredResources = resources;

        if (tempFilters.department !== 'all') {
            filteredResources = filteredResources.filter(r =>
                r.department === tempFilters.department
            );
        }

        if (tempFilters.professor !== 'all') {
            filteredResources = filteredResources.filter(r =>
                r.professorName === tempFilters.professor
            );
        }

        return ['all', ...Array.from(new Set(
            filteredResources
                .map(r => r.course)
                .filter(Boolean)
        ))];
    }, [resources, tempFilters.department, tempFilters.professor]);

    // Toggle expanded section
    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const renderItem: ListRenderItem<Resource> = useCallback(({ item }) => (
        <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            layout={Layout.springify()}
        >
            <Card style={styles.resourceCard}>
                <Card.Content>
                    <View style={styles.resourceHeader}>
                        <View style={styles.resourceTitleContainer}>
                            <Text style={styles.resourceTitle} numberOfLines={2}>{item.name}</Text>
                            <MaterialCommunityIcons name="file-document-outline" size={22} color={theme.colors.primary} />
                        </View>

                        {item.description && (
                            <Text style={styles.resourceDescription} numberOfLines={2}>{item.description}</Text>
                        )}
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.chipContainer}>
                        <Chip
                            mode="outlined"
                            style={styles.chip}
                            textStyle={styles.chipText}
                        >
                            {item.department}
                        </Chip>
                        <Chip
                            mode="outlined"
                            style={styles.chip}
                            textStyle={styles.chipText}
                        >
                            Year {item.year}
                        </Chip>
                        {item.course && (
                            <Chip
                                mode="outlined"
                                style={[styles.chip, { borderColor: theme.colors.primary }]}
                                textStyle={[styles.chipText, { color: theme.colors.primary }]}
                            >
                                {item.course}
                            </Chip>
                        )}
                    </View>

                    {item.externalLinks && item.externalLinks.length > 0 && (
                        <>
                            <Divider style={styles.divider} />
                            <View style={styles.externalLinksContainer}>
                                <Text style={styles.externalLinksTitle}>External Links:</Text>
                                <View style={styles.externalLinksList}>
                                    {item.externalLinks.map((link, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.externalLinkItem}
                                            onPress={() => Linking.openURL(link)}
                                        >
                                            <MaterialCommunityIcons name="link-variant" size={18} color={theme.colors.primary} />
                                            <Text
                                                style={styles.externalLinkText}
                                                numberOfLines={1}
                                                ellipsizeMode="middle"
                                            >
                                                {link}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}
                </Card.Content>
                <Card.Actions>
                    <Button
                        mode="contained"
                        disabled={!item.cid}
                        style={[
                            styles.viewButton,
                            !item.cid && styles.disabledButton
                        ]}
                        onPress={() => item.cid ? createSignedURL(item.cid, item.id) : null}
                        loading={item.id === loadingResourceId}
                    >
                        {item.id === loadingResourceId ? 'Preparing...' :
                            item.cid ? 'Download Resource' : 'No Resource Available'}
                    </Button>
                </Card.Actions>
            </Card>
        </Animated.View>
    ), [theme.colors, loadingResourceId]);

    const ListEmptyComponent = useCallback(() => (
        <Animated.View
            style={styles.centerContainer}
            entering={FadeIn.duration(300)}
        >
            <MaterialCommunityIcons name="file-document-outline" size={48} color={theme.colors.primary} />
            <Text style={styles.emptyStateTitle}>No resources found</Text>
            <Text style={styles.emptyStateSubtitle}>
                Try adjusting your search or filters
            </Text>
        </Animated.View>
    ), [styles, theme.colors.primary]);

    // Render filter chips
    const renderFilterChips = () => {
        const activeFilters = Object.entries(filters).filter(([_, value]) => value !== 'all');

        if (activeFilters.length === 0) return null;

        return (
            <View style={styles.filterChipsContainer}>
                {activeFilters.map(([key, value]) => (
                    <Chip
                        key={key}
                        style={styles.filterChip}
                        onClose={() => setFilters(prev => ({ ...prev, [key]: 'all' }))}
                    >
                        {key}: {value}
                    </Chip>
                ))}
            </View>
        );
    };

    const renderFilterModal = () => (
        <Modal
            visible={showFilterModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFilterModal(false)}
        >
            <View style={styles.modalOverlay}>
                <Surface style={styles.filterModal}>
                    <View style={styles.filterModalHeader}>
                        <Text style={styles.filterModalTitle}>Filter Resources</Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.onSurface} />
                        </TouchableOpacity>
                    </View>

                    <Divider style={styles.modalDivider} />

                    <ScrollView style={styles.filterModalContent}>
                        {/* Department Dropdown */}
                        <TouchableOpacity
                            style={styles.dropdownHeader}
                            onPress={() => toggleSection('department')}
                        >
                            <View style={styles.dropdownTitleContainer}>
                                <Text style={styles.dropdownTitle}>Department</Text>
                                <Text style={styles.dropdownValue}>
                                    {tempFilters.department === 'all' ? 'All Departments' : tempFilters.department}
                                </Text>
                            </View>
                            <MaterialCommunityIcons
                                name={expandedSection === 'department' ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </TouchableOpacity>

                        {expandedSection === 'department' && (
                            <View style={styles.dropdownContent}>
                                {uniqueValues.departments.map(dept => (
                                    <TouchableOpacity
                                        key={dept}
                                        style={[
                                            styles.dropdownItem,
                                            tempFilters.department === dept && styles.selectedDropdownItem
                                        ]}
                                        onPress={() => {
                                            // Reset dependent filters when department changes
                                            setTempFilters(prev => ({
                                                ...prev,
                                                department: dept,
                                                professor: 'all',
                                                course: 'all'
                                            }));
                                            toggleSection('department');
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            tempFilters.department === dept && styles.selectedDropdownItemText
                                        ]}>
                                            {dept === 'all' ? 'All Departments' : dept}
                                        </Text>
                                        {tempFilters.department === dept && (
                                            <MaterialCommunityIcons
                                                name="check"
                                                size={20}
                                                color={theme.colors.primary}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Divider style={styles.sectionDivider} />

                        {/* Professor Dropdown */}
                        <TouchableOpacity
                            style={styles.dropdownHeader}
                            onPress={() => toggleSection('professor')}
                        >
                            <View style={styles.dropdownTitleContainer}>
                                <Text style={styles.dropdownTitle}>Professor</Text>
                                <Text style={styles.dropdownValue}>
                                    {tempFilters.professor === 'all' ? 'All Professors' : tempFilters.professor}
                                </Text>
                            </View>
                            <MaterialCommunityIcons
                                name={expandedSection === 'professor' ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </TouchableOpacity>

                        {expandedSection === 'professor' && (
                            <View style={styles.dropdownContent}>
                                {getFilteredProfessors().map(prof => (
                                    <TouchableOpacity
                                        key={prof}
                                        style={[
                                            styles.dropdownItem,
                                            tempFilters.professor === prof && styles.selectedDropdownItem
                                        ]}
                                        onPress={() => {
                                            setTempFilters(prev => ({
                                                ...prev,
                                                professor: prof,
                                                course: 'all'
                                            }));
                                            toggleSection('professor');
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            tempFilters.professor === prof && styles.selectedDropdownItemText
                                        ]}>
                                            {prof === 'all' ? 'All Professors' : prof}
                                        </Text>
                                        {tempFilters.professor === prof && (
                                            <MaterialCommunityIcons
                                                name="check"
                                                size={20}
                                                color={theme.colors.primary}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Divider style={styles.sectionDivider} />

                        {/* Course Dropdown */}
                        <TouchableOpacity
                            style={styles.dropdownHeader}
                            onPress={() => toggleSection('course')}
                        >
                            <View style={styles.dropdownTitleContainer}>
                                <Text style={styles.dropdownTitle}>Course</Text>
                                <Text style={styles.dropdownValue}>
                                    {tempFilters.course === 'all' ? 'All Courses' : tempFilters.course}
                                </Text>
                            </View>
                            <MaterialCommunityIcons
                                name={expandedSection === 'course' ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </TouchableOpacity>

                        {expandedSection === 'course' && (
                            <View style={styles.dropdownContent}>
                                {getFilteredCourses().map(course => (
                                    <TouchableOpacity
                                        key={course}
                                        style={[
                                            styles.dropdownItem,
                                            tempFilters.course === course && styles.selectedDropdownItem
                                        ]}
                                        onPress={() => {
                                            setTempFilters(prev => ({ ...prev, course }));
                                            toggleSection('course');
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            tempFilters.course === course && styles.selectedDropdownItemText
                                        ]}>
                                            {course === 'all' ? 'All Courses' : course}
                                        </Text>
                                        {tempFilters.course === course && (
                                            <MaterialCommunityIcons
                                                name="check"
                                                size={20}
                                                color={theme.colors.primary}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Divider style={styles.sectionDivider} />

                        {/* Year Filter with Chips */}
                        <View style={styles.yearSection}>
                            <Text style={styles.dropdownTitle}>Year</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={styles.chipOptionsContainer}>
                                    {uniqueValues.years.map(year => (
                                        <Chip
                                            key={year}
                                            mode={tempFilters.year === year ? "flat" : "outlined"}
                                            selected={tempFilters.year === year}
                                            onPress={() => setTempFilters(prev => ({ ...prev, year }))}
                                            style={[
                                                styles.filterOptionChip,
                                                tempFilters.year === year && styles.selectedChip
                                            ]}
                                        >
                                            {year === 'all' ? 'All Years' : `Year ${year}`}
                                        </Chip>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </ScrollView>

                    <Divider style={styles.modalDivider} />

                    <View style={styles.filterModalFooter}>
                        <Button
                            mode="outlined"
                            onPress={resetFilters}
                            style={styles.filterButton}
                        >
                            Reset
                        </Button>
                        <Button
                            mode="contained"
                            onPress={applyFilters}
                            style={styles.filterButton}
                        >
                            Apply Filters
                        </Button>
                    </View>
                </Surface>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <Surface style={styles.headerContainer} elevation={4}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Study Resources</Text>
                    <Text style={styles.headerSubtitle}>Browse learning materials</Text>
                    <Searchbar
                        placeholder="Search resources..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={styles.searchInput}
                        icon={() => <Ionicons name="search" size={20} color={theme.colors.primary} />}
                        clearIcon={() =>
                            searchQuery ?
                                <Ionicons name="close-circle" size={20} color={theme.colors.primary} />
                                : undefined
                        }
                    />
                </View>
            </Surface>

            <View style={styles.filterButtonContainer}>
                <Button
                    mode="outlined"
                    icon="filter-variant"
                    onPress={openFilterModal}
                    style={styles.mainFilterButton}
                >
                    Filter Resources
                    {Object.values(filters).some(v => v !== 'all') && ' (Active)'}
                </Button>
            </View>

            {renderFilterChips()}

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size={32} color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading resources...</Text>
                </View>
            ) : (
                <AnimatedFlatList
                    data={filteredResources}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={ListEmptyComponent}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    removeClippedSubviews={true}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}

            {renderFilterModal()}
        </View>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom : 100,
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
        marginBottom: 16,
    },
    searchBar: {
        elevation: 0,
        borderRadius: 12,
        backgroundColor: theme.colors.surfaceVariant,
    },
    searchInput: {
        fontSize: 16,
    },
    filterButtonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    mainFilterButton: {
        borderRadius: 8,
        borderColor: theme.colors.primary,
    },
    filterChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 12,
    },
    filterChip: {
        backgroundColor: theme.colors.secondaryContainer,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
    },
    resourceCard: {
        borderRadius: 16,
        backgroundColor: theme.colors.surface,
        elevation: 2,
    },
    resourceHeader: {
        marginBottom: 12,
    },
    resourceTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    resourceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        color: theme.colors.onSurface,
    },
    resourceDescription: {
        fontSize: 14,
        color: theme.colors.onSurfaceVariant,
    },
    divider: {
        marginVertical: 12,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        borderWidth: 1,
        borderColor: theme.colors.outline,
    },
    chipText: {
        fontSize: 12,
    },
    viewButton: {
        width: '100%',
    },
    disabledButton: {
        opacity: 0.6,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    loadingText: {
        marginTop: 12,
        color: theme.colors.primary,
        fontSize: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.onSurface,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: theme.colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: 4,
    },
    separator: {
        height: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    filterModal: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
    },
    filterModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    filterModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.onSurface,
    },
    modalDivider: {
        marginVertical: 0,
    },
    filterModalContent: {
        paddingVertical: 8,
        maxHeight: '70%',
    },
    sectionDivider: {
        marginVertical: 8,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownTitleContainer: {
        flex: 1,
    },
    dropdownTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
        marginBottom: 2,
    },
    dropdownValue: {
        fontSize: 14,
        color: theme.colors.onSurfaceVariant,
    },
    dropdownContent: {
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 8,
        maxHeight: 200,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surfaceVariant,
    },
    selectedDropdownItem: {
        backgroundColor: theme.colors.primaryContainer,
    },
    dropdownItemText: {
        fontSize: 14,
        color: theme.colors.onSurface,
    },
    selectedDropdownItemText: {
        color: theme.colors.primary,
        fontWeight: '500',
    },
    yearSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    chipOptionsContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
        gap: 8,
    },
    filterOptionChip: {
        marginRight: 4,
    },
    selectedChip: {
        backgroundColor: theme.colors.primaryContainer,
    },
    filterModalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 24,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.surfaceVariant,
    },
    filterButton: {
        flex: 1,
        marginHorizontal: 8,
    },
    externalLinksContainer: {
        marginTop: 4,
    },
    externalLinksTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.onSurface,
        marginBottom: 8,
    },
    externalLinksList: {
        marginLeft: 4,
    },
    externalLinkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
    },
    externalLinkText: {
        marginLeft: 8,
        fontSize: 14,
        color: theme.colors.primary,
        textDecorationLine: 'underline',
        flex: 1,
    },
});

export default ResourcesScreen;
