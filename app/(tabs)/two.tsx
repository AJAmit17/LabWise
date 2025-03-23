import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme, Text, Searchbar, ActivityIndicator, Surface, Chip, MD3Theme as Theme, Button, Divider } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import ExperimentCard from '@/components/ExperimentCard';
import { Experiment } from '@/types';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Experiment>);

const ExperimentList: React.FC = () => {
    const theme = useTheme();
    const styles = createStyles(theme);

    const [isLoading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>([]);

    // Filter states
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        branch: 'all',
        year: 'all',
        courseName: 'all'
    });
    const [tempFilters, setTempFilters] = useState({
        branch: 'all',
        year: 'all',
        courseName: 'all'
    });
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState('ExpNo');
    const [sortOrder, setSortOrder] = useState('asc');

    // Extract unique values for filters
    const uniqueValues = {
        branches: ['all', ...Array.from(new Set(experiments.map(exp => exp.Branch || '')))],
        years: ['all', ...Array.from(new Set(experiments.map(exp => exp.year?.toString() || '')))],
        courseNames: ['all', ...Array.from(new Set(experiments.map(exp => exp.CName || 'Unknown')))],
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            // Build query parameters based on filters
            const params = new URLSearchParams();
            if (filters.branch !== 'all') params.append('branch', filters.branch);
            if (filters.year !== 'all') params.append('year', filters.year);
            if (sortBy) params.append('sortBy', sortBy);
            if (sortOrder) params.append('sortOrder', sortOrder);

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const response = await fetch(`https://labwise-web.vercel.app/api/experiments${queryString}`);
            const json = await response.json();
            setExperiments(json.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [filters, sortBy, sortOrder]);

    useEffect(() => {
        // Apply search and course name filter
        const filtered = experiments.filter(exp => {
            const matchesSearch = searchQuery === '' ||
                exp.ExpName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                exp.ExpDesc?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCourseName = filters.courseName === 'all' || exp.CName === filters.courseName;

            return matchesSearch && matchesCourseName;
        });

        setFilteredExperiments(filtered);
    }, [searchQuery, experiments, filters.courseName]);

    // Filter UI controls
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
            branch: 'all',
            year: 'all',
            courseName: 'all'
        };
        setTempFilters(resetValues);
        setFilters(resetValues);
        setSortBy('ExpNo');
        setSortOrder('asc');
        setShowFilterModal(false);
    };

    // Toggle expanded section in filter modal
    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    // Get filtered course names based on selected branch and year
    const getFilteredCourseNames = useCallback(() => {
        let filteredExps = experiments;

        if (tempFilters.branch !== 'all') {
            filteredExps = filteredExps.filter(exp =>
                exp.Branch === tempFilters.branch
            );
        }

        if (tempFilters.year !== 'all') {
            filteredExps = filteredExps.filter(exp =>
                exp.year?.toString() === tempFilters.year
            );
        }

        return ['all', ...Array.from(new Set(
            filteredExps
                .map(exp => exp.CName)
                .filter(Boolean)
        ))];
    }, [experiments, tempFilters.branch, tempFilters.year]);

    const renderItem: ListRenderItem<Experiment> = useCallback(({ item }) => (
        <Animated.View
            key={item.id}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            layout={Layout.springify()}
        >
            <ExperimentCard experiment={item} />
        </Animated.View>
    ), []);

    // Render filter chips
    const renderFilterChips = () => {
        const activeFilters = Object.entries(filters).filter(([_, value]) => value !== 'all');

        if (activeFilters.length === 0 && sortBy === 'ExpNo' && sortOrder === 'asc') return null;

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
                {(sortBy !== 'ExpNo' || sortOrder !== 'asc') && (
                    <Chip
                        style={styles.filterChip}
                        onClose={() => {
                            setSortBy('ExpNo');
                            setSortOrder('asc');
                        }}
                    >
                        Sort: {sortBy} ({sortOrder})
                    </Chip>
                )}
            </View>
        );
    };

    // Render filter modal
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
                        <Text style={styles.filterModalTitle}>Filter Experiments</Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                            <Ionicons name="close" size={24} color={theme.colors.onSurface} />
                        </TouchableOpacity>
                    </View>

                    <Divider style={styles.modalDivider} />

                    <ScrollView style={styles.filterModalContent}>
                        {/* Branch Dropdown */}
                        <TouchableOpacity
                            style={styles.dropdownHeader}
                            onPress={() => toggleSection('branch')}
                        >
                            <View style={styles.dropdownTitleContainer}>
                                <Text style={styles.dropdownTitle}>Branch</Text>
                                <Text style={styles.dropdownValue}>
                                    {tempFilters.branch === 'all' ? 'All Branches' : tempFilters.branch}
                                </Text>
                            </View>
                            <MaterialCommunityIcons
                                name={expandedSection === 'branch' ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </TouchableOpacity>

                        {expandedSection === 'branch' && (
                            <View style={styles.dropdownContent}>
                                {uniqueValues.branches.map(branch => (
                                    <TouchableOpacity
                                        key={branch}
                                        style={[
                                            styles.dropdownItem,
                                            tempFilters.branch === branch && styles.selectedDropdownItem
                                        ]}
                                        onPress={() => {
                                            setTempFilters(prev => ({
                                                ...prev,
                                                branch: branch,
                                                courseName: 'all'
                                            }));
                                            toggleSection('branch');
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            tempFilters.branch === branch && styles.selectedDropdownItemText
                                        ]}>
                                            {branch === 'all' ? 'All Branches' : branch}
                                        </Text>
                                        {tempFilters.branch === branch && (
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
                                            onPress={() => setTempFilters(prev => ({
                                                ...prev,
                                                year,
                                                courseName: 'all'
                                            }))}
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

                        <Divider style={styles.sectionDivider} />

                        {/* Course Name Dropdown */}
                        <TouchableOpacity
                            style={styles.dropdownHeader}
                            onPress={() => toggleSection('courseName')}
                        >
                            <View style={styles.dropdownTitleContainer}>
                                <Text style={styles.dropdownTitle}>Course</Text>
                                <Text style={styles.dropdownValue}>
                                    {tempFilters.courseName === 'all' ? 'All Courses' : tempFilters.courseName}
                                </Text>
                            </View>
                            <MaterialCommunityIcons
                                name={expandedSection === 'courseName' ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </TouchableOpacity>

                        {expandedSection === 'courseName' && (
                            <View style={styles.dropdownContent}>
                                {getFilteredCourseNames().map(course => (
                                    <TouchableOpacity
                                        key={course}
                                        style={[
                                            styles.dropdownItem,
                                            tempFilters.courseName === course && styles.selectedDropdownItem
                                        ]}
                                        onPress={() => {
                                            setTempFilters(prev => ({ ...prev, courseName: course }));
                                            toggleSection('courseName');
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            tempFilters.courseName === course && styles.selectedDropdownItemText
                                        ]}>
                                            {course === 'all' ? 'All Courses' : course}
                                        </Text>
                                        {tempFilters.courseName === course && (
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

                        {/* Sort Options */}
                        <View style={styles.sortSection}>
                            <Text style={styles.dropdownTitle}>Sort By</Text>
                            <View style={styles.sortOptions}>
                                <View style={styles.sortByContainer}>
                                    <TouchableOpacity
                                        style={[styles.sortByOption, sortBy === 'ExpNo' && styles.selectedSortOption]}
                                        onPress={() => setSortBy('ExpNo')}
                                    >
                                        <Text style={sortBy === 'ExpNo' ? styles.selectedDropdownItemText : styles.dropdownItemText}>Experiment No</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.sortByOption, sortBy === 'ExpName' && styles.selectedSortOption]}
                                        onPress={() => setSortBy('ExpName')}
                                    >
                                        <Text style={sortBy === 'ExpName' ? styles.selectedDropdownItemText : styles.dropdownItemText}>Name</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.sortByOption, sortBy === 'year' && styles.selectedSortOption]}
                                        onPress={() => setSortBy('year')}
                                    >
                                        <Text style={sortBy === 'year' ? styles.selectedDropdownItemText : styles.dropdownItemText}>Year</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.sortOrderContainer}>
                                    <TouchableOpacity
                                        style={[styles.sortOrderOption, sortOrder === 'asc' && styles.selectedSortOption]}
                                        onPress={() => setSortOrder('asc')}
                                    >
                                        <MaterialCommunityIcons
                                            name="sort-ascending"
                                            size={20}
                                            color={sortOrder === 'asc' ? theme.colors.primary : theme.colors.onSurface}
                                        />
                                        <Text style={sortOrder === 'asc' ? styles.selectedDropdownItemText : styles.dropdownItemText}>Asc</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.sortOrderOption, sortOrder === 'desc' && styles.selectedSortOption]}
                                        onPress={() => setSortOrder('desc')}
                                    >
                                        <MaterialCommunityIcons
                                            name="sort-descending"
                                            size={20}
                                            color={sortOrder === 'desc' ? theme.colors.primary : theme.colors.onSurface}
                                        />
                                        <Text style={sortOrder === 'desc' ? styles.selectedDropdownItemText : styles.dropdownItemText}>Desc</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
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

    const ListEmptyComponent = useCallback(() => (
        <Animated.View
            style={styles.centerContainer}
            entering={FadeIn.duration(300)}
        >
            <Ionicons name="documents-outline" size={48} color={theme.colors.primary} />
            <Text style={styles.emptyStateTitle}>No experiments found</Text>
            <Text style={styles.emptyStateSubtitle}>
                Try adjusting your search or filters
            </Text>
        </Animated.View>
    ), [styles, theme.colors.primary]);

    return (
        <View style={styles.container}>
            <Surface style={styles.headerContainer} elevation={4}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Lab Experiments</Text>
                    <Text style={styles.headerSubtitle}>CSE-DS Lab Experiments</Text>
                    <Searchbar
                        placeholder="Search experiments..."
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
                    Filter Experiments
                    {(Object.values(filters).some(v => v !== 'all') || sortBy !== 'ExpNo' || sortOrder !== 'asc') && ' (Active)'}
                </Button>
            </View>

            {renderFilterChips()}

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size={32} color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading experiments...</Text>
                </View>
            ) : (
                <AnimatedFlatList
                    data={filteredExperiments}
                    renderItem={renderItem}
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
    sortSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sortOptions: {
        marginTop: 8,
    },
    sortByContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    sortByOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.outline,
    },
    sortOrderContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    sortOrderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.outline,
        gap: 6,
    },
    selectedSortOption: {
        backgroundColor: theme.colors.primaryContainer,
        borderColor: theme.colors.primary,
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
});

export default ExperimentList;