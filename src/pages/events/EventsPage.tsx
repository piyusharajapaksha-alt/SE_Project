import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useLocation,
} from 'react-router-dom';

import {
  useAuth,
} from '@/contexts/AuthContext';

import {
  useToast,
} from '@/contexts/ToastContext';

import {
  eventService,
} from '@/services/dataServices';

import {
  PageHeader,
  SearchInput,
  SelectFilter,
  Badge,
  Pagination,
  LoadingState,
  EmptyState,
  StatCard,
  Modal,
  ConfirmDialog,
  FormInput,
  FormSelect,
  FormTextarea,
} from '@/components/ui';

import {
  EVENT_CATEGORIES,
} from '@/config';

import {
  Calendar,
  Plus,
  Users,
  MapPin,
  Clock,
  UserPlus,
  UserMinus,
  Trash2,
  Eye,
  Edit,
  Loader2,
  CheckCircle,
  XCircle,
  CalendarDays,
  UserCheck,
} from 'lucide-react';


type EventRecord = {
  id: number;
  title: string;
  description?: string;
  organizerId: string;
  organizer?: string;
  category: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  capacity: number;
  status: string;
  registeredCount: number;
  availableSeats: number;
  registeredIds?: string[];
  registrantNames?: {
    employeeId: string;
    name: string;
    department?: string;
  }[];
};


type EventForm = {
  title: string;
  description: string;
  organizerId: string;
  category: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  capacity: string;
  status: string;
};


const EMPTY_FORM: EventForm = {
  title: '',
  description: '',
  organizerId: '',
  category: 'Team Building',
  date: '',
  time: '',
  endTime: '',
  location: '',
  capacity: '50',
  status: 'Upcoming',
};


export default function EventsPage() {

  const {
    user,
    checkPermission,
  } = useAuth();

  const {
    addToast,
  } = useToast();

  const location =
    useLocation();


  const isManagementView =
    location.pathname.startsWith(
      '/management/'
    );


  const canManage =
    isManagementView &&
    checkPermission(
      'events.manage'
    );


  const [events, setEvents] =
    useState<EventRecord[]>([]);

  const [allEvents, setAllEvents] =
    useState<EventRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');


  const [search, setSearch] =
    useState('');

  const [categoryFilter, setCategoryFilter] =
    useState('All');

  const [statusFilter, setStatusFilter] =
    useState('All');


  const [currentPage, setCurrentPage] =
    useState(1);


  const [showDetail, setShowDetail] =
    useState<EventRecord | null>(null);


  const [showForm, setShowForm] =
    useState(false);

  const [editingEvent, setEditingEvent] =
    useState<EventRecord | null>(null);


  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [saving, setSaving] =
    useState(false);


  const [form, setForm] =
    useState<EventForm>(
      EMPTY_FORM
    );


  const [errors, setErrors] =
    useState<Record<string, string>>({});


  const perPage =
    isManagementView
      ? 10
      : 8;


  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {

    loadData();

  }, [
    search,
    categoryFilter,
    statusFilter,
    isManagementView,
    user?.employeeId,
  ]);


  const loadData = async () => {

    setLoading(true);
    setErrorMessage('');

    try {

      const filters: Record<
        string,
        string
      > = {};


      if (
        search.trim()
      ) {
        filters.search =
          search.trim();
      }


      if (
        categoryFilter !== 'All'
      ) {
        filters.category =
          categoryFilter;
      }


      if (
        statusFilter !== 'All'
      ) {
        filters.status =
          statusFilter;
      }


      if (user?.employeeId) {
        filters.employeeId =
          user.employeeId;
      }


      const data =
        await eventService.getAll(
          filters
        );


      const eventData =
        Array.isArray(data)
          ? data
          : [];


      setEvents(eventData);


      if (isManagementView) {

        const summaryData =
          await eventService.getAll({
            employeeId:
              user?.employeeId,
          });

        setAllEvents(
          Array.isArray(summaryData)
            ? summaryData
            : []
        );

      } else {

        setAllEvents([]);
      }


      setCurrentPage(1);

    } catch (error) {

      console.error(
        'Failed to load events:',
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load events. Please check the backend connection.'
      );

      setEvents([]);

      setAllEvents([]);

    } finally {

      setLoading(false);
    }
  };


  // ============================================================
  // SUMMARY
  // ============================================================

  const summary =
    useMemo(() => {

      const total =
        allEvents.length;

      const upcoming =
        allEvents.filter(
          (event) =>
            event.status ===
            'Upcoming'
        ).length;

      const ongoing =
        allEvents.filter(
          (event) =>
            event.status ===
            'Ongoing'
        ).length;

      const completed =
        allEvents.filter(
          (event) =>
            event.status ===
            'Completed'
        ).length;

      const cancelled =
        allEvents.filter(
          (event) =>
            event.status ===
            'Cancelled'
        ).length;

      const registrations =
        allEvents.reduce(
          (
            totalRegistrations,
            event
          ) =>
            totalRegistrations +
            (
              Number(
                event.registeredCount
              ) || 0
            ),
          0
        );


      return {
        total,
        upcoming,
        ongoing,
        completed,
        cancelled,
        registrations,
      };

    }, [allEvents]);


  // ============================================================
  // FORM
  // ============================================================

  const openCreateForm =
    () => {

      setEditingEvent(null);

      setForm({
        ...EMPTY_FORM,
        organizerId:
          user?.employeeId || '',
      });

      setErrors({});

      setShowForm(true);
    };


  const openEditForm =
    (event: EventRecord) => {

      setEditingEvent(event);

      setForm({
        title:
          event.title || '',

        description:
          event.description || '',

        organizerId:
          event.organizerId ||
          user?.employeeId ||
          '',

        category:
          event.category ||
          'Team Building',

        date:
          event.date || '',

        time:
          event.time
            ? event.time.substring(
                0,
                5
              )
            : '',

        endTime:
          event.endTime
            ? event.endTime.substring(
                0,
                5
              )
            : '',

        location:
          event.location || '',

        capacity:
          String(
            event.capacity || 50
          ),

        status:
          event.status ||
          'Upcoming',
      });

      setErrors({});

      setShowForm(true);
    };


  const validate =
    () => {

      const nextErrors:
        Record<string, string> =
        {};


      if (
        !form.title.trim()
      ) {
        nextErrors.title =
          'Event title is required';
      }


      if (
        !form.organizerId.trim()
      ) {
        nextErrors.organizerId =
          'Organizer is required';
      }


      if (
        !form.date
      ) {
        nextErrors.date =
          'Date is required';
      }


      if (
        !form.time
      ) {
        nextErrors.time =
          'Start time is required';
      }


      if (
        !form.endTime
      ) {
        nextErrors.endTime =
          'End time is required';
      }


      if (
        form.time &&
        form.endTime &&
        form.endTime <= form.time
      ) {
        nextErrors.endTime =
          'End time must be after start time';
      }


      if (
        !form.location.trim()
      ) {
        nextErrors.location =
          'Location is required';
      }


      const capacity =
        Number(
          form.capacity
        );


      if (
        !Number.isInteger(
          capacity
        ) ||
        capacity <= 0
      ) {
        nextErrors.capacity =
          'Capacity must be greater than 0';
      }


      setErrors(
        nextErrors
      );


      return (
        Object.keys(
          nextErrors
        ).length === 0
      );
    };


  const handleSubmit =
    async (
      event: React.FormEvent
    ) => {

      event.preventDefault();


      if (
        !validate()
      ) {
        return;
      }


      setSaving(true);


      try {

        const payload = {
          title:
            form.title.trim(),

          description:
            form.description.trim(),

          organizerId:
            form.organizerId.trim(),

          category:
            form.category,

          date:
            form.date,

          time:
            form.time,

          endTime:
            form.endTime,

          location:
            form.location.trim(),

          capacity:
            Number(
              form.capacity
            ),

          status:
            form.status,
        };


        if (editingEvent) {

          await eventService.update(
            editingEvent.id,
            payload
          );

          addToast(
            'success',
            'Event updated successfully'
          );

        } else {

          await eventService.create(
            payload
          );

          addToast(
            'success',
            'Event created successfully'
          );
        }


        setShowForm(false);

        setEditingEvent(null);

        setForm(
          EMPTY_FORM
        );

        setErrors({});


        await loadData();

      } catch (error) {

        console.error(
          'Event save failed:',
          error
        );

        addToast(
          'error',
          error instanceof Error
            ? error.message
            : 'Failed to save event'
        );

      } finally {

        setSaving(false);
      }
    };


  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete =
    async () => {

      if (
        deleteId === null
      ) {
        return;
      }


      setDeleting(true);


      try {

        await eventService.delete(
          deleteId
        );


        addToast(
          'success',
          'Event deleted successfully'
        );


        setDeleteId(null);

        setShowDetail(null);


        await loadData();

      } catch (error) {

        console.error(
          'Event delete failed:',
          error
        );

        addToast(
          'error',
          error instanceof Error
            ? error.message
            : 'Failed to delete event'
        );

      } finally {

        setDeleting(false);
      }
    };


  // ============================================================
  // REGISTER
  // ============================================================

  const handleRegister =
    async (
      id: number
    ) => {

      if (!user) {
        return;
      }


      try {

        await eventService.register(
          id,
          user.employeeId
        );


        addToast(
          'success',
          'Registered for event successfully'
        );


        await loadData();

      } catch (error) {

        console.error(
          'Event registration failed:',
          error
        );

        addToast(
          'error',
          error instanceof Error
            ? error.message
            : 'Failed to register for event'
        );
      }
    };


  // ============================================================
  // UNREGISTER
  // ============================================================

  const handleUnregister =
    async (
      id: number
    ) => {

      if (!user) {
        return;
      }


      try {

        await eventService.unregister(
          id,
          user.employeeId
        );


        addToast(
          'success',
          'Registration cancelled'
        );


        await loadData();

      } catch (error) {

        console.error(
          'Event unregister failed:',
          error
        );

        addToast(
          'error',
          error instanceof Error
            ? error.message
            : 'Failed to cancel registration'
        );
      }
    };


  // ============================================================
  // DETAILS
  // ============================================================

  const openDetails =
    async (
      event: EventRecord
    ) => {

      try {

        const detail =
          await eventService.getById(
            event.id,
            user?.employeeId
          );

        setShowDetail(
          detail
        );

      } catch (error) {

        console.error(
          'Failed to load event details:',
          error
        );

        addToast(
          'error',
          error instanceof Error
            ? error.message
            : 'Failed to load event details'
        );
      }
    };


  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages =
    Math.ceil(
      events.length /
      perPage
    );


  const pagedEvents =
    events.slice(
      (currentPage - 1) *
        perPage,

      currentPage *
        perPage
    );


  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusVariant =
    (
      status: string
    ) => {

      switch (status) {

        case 'Upcoming':
          return 'info';

        case 'Ongoing':
          return 'warning';

        case 'Completed':
          return 'success';

        case 'Cancelled':
          return 'neutral';

        default:
          return 'info';
      }
    };


  return (
    <div>

      <PageHeader
        title={
          isManagementView
            ? 'Event Management'
            : 'Events'
        }
        description={
          isManagementView
            ? 'Create, manage and monitor organizational events'
            : 'Discover and register for organizational events'
        }
        action={
          canManage ? (
            <button
              onClick={
                openCreateForm
              }
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />

              Create Event
            </button>
          ) : undefined
        }
      />


      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}


      {/* ======================================================
          MANAGEMENT SUMMARY
          ====================================================== */}

      {isManagementView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">

          <StatCard
            title="Total Events"
            value={
              summary.total
            }
            icon={
              <Calendar className="h-5 w-5" />
            }
            color="blue"
          />


          <StatCard
            title="Upcoming"
            value={
              summary.upcoming
            }
            icon={
              <CalendarDays className="h-5 w-5" />
            }
            color="indigo"
          />


          <StatCard
            title="Ongoing"
            value={
              summary.ongoing
            }
            icon={
              <Clock className="h-5 w-5" />
            }
            color="amber"
          />


          <StatCard
            title="Completed"
            value={
              summary.completed
            }
            icon={
              <CheckCircle className="h-5 w-5" />
            }
            color="green"
          />


          <StatCard
            title="Cancelled"
            value={
              summary.cancelled
            }
            icon={
              <XCircle className="h-5 w-5" />
            }
            color="red"
          />


          <StatCard
            title="Registrations"
            value={
              summary.registrations
            }
            icon={
              <UserCheck className="h-5 w-5" />
            }
            color="purple"
          />

        </div>
      )}


      {/* ======================================================
          FILTERS
          ====================================================== */}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">

        <div className="flex-1">

          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(
                value
              );

              setCurrentPage(
                1
              );
            }}
            placeholder="Search events..."
          />

        </div>


        <SelectFilter
          value={
            categoryFilter
          }
          onChange={(value) => {
            setCategoryFilter(
              value
            );

            setCurrentPage(
              1
            );
          }}
          options={
            EVENT_CATEGORIES
          }
          placeholder="All Categories"
        />


        <SelectFilter
          value={
            statusFilter
          }
          onChange={(value) => {
            setStatusFilter(
              value
            );

            setCurrentPage(
              1
            );
          }}
          options={[
            'Upcoming',
            'Ongoing',
            'Completed',
            'Cancelled',
          ]}
          placeholder="All Statuses"
        />

      </div>


      {/* ======================================================
          EVENTS
          ====================================================== */}

      {loading ? (

        <LoadingState />

      ) : events.length === 0 ? (

        <EmptyState
          icon={
            <Calendar className="h-6 w-6" />
          }
          title="No events found"
        />

      ) : (

        <>

          <div
            className={
              isManagementView
                ? 'bg-white rounded-xl border border-gray-200 overflow-hidden'
                : 'grid grid-cols-1 md:grid-cols-2 gap-4'
            }
          >

            {isManagementView ? (

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Event
                      </th>

                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Category
                      </th>

                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Date
                      </th>

                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Location
                      </th>

                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Capacity
                      </th>

                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Status
                      </th>

                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {pagedEvents.map(
                      (event) => (

                        <tr
                          key={
                            event.id
                          }
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >

                          <td className="py-3 px-4">

                            <div>

                              <p className="font-medium text-gray-900">
                                {
                                  event.title
                                }
                              </p>

                              <p className="text-xs text-gray-500 mt-0.5">
                                {
                                  event.organizer
                                }
                              </p>

                            </div>

                          </td>


                          <td className="py-3 px-4 text-gray-600">
                            {
                              event.category
                            }
                          </td>


                          <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                            {
                              event.date
                            }

                            <div className="text-xs text-gray-400">
                              {
                                event.time
                              }
                              {' - '}
                              {
                                event.endTime
                              }
                            </div>
                          </td>


                          <td className="py-3 px-4 text-gray-600">
                            {
                              event.location
                            }
                          </td>


                          <td className="py-3 px-4">

                            <div className="flex items-center gap-2">

                              <Users className="h-4 w-4 text-gray-400" />

                              <span>
                                {
                                  event.registeredCount
                                }
                                /
                                {
                                  event.capacity
                                }
                              </span>

                            </div>

                          </td>


                          <td className="py-3 px-4">

                            <Badge
                              variant={
                                getStatusVariant(
                                  event.status
                                ) as any
                              }
                              dot
                            >
                              {
                                event.status
                              }
                            </Badge>

                          </td>


                          <td className="py-3 px-4">

                            <div className="flex items-center justify-end gap-1">

                              <button
                                onClick={() =>
                                  openDetails(
                                    event
                                  )
                                }
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>


                              {canManage && (
                                <button
                                  onClick={() =>
                                    openEditForm(
                                      event
                                    )
                                  }
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}


                              {canManage && (
                                <button
                                  onClick={() =>
                                    setDeleteId(
                                      event.id
                                    )
                                  }
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              pagedEvents.map(
                (event) => {

                  const isRegistered =
                    !!user &&
                    !!event.registeredIds?.includes(
                      user.employeeId
                    );


                  const percentage =
                    event.capacity > 0
                      ? Math.min(
                          (
                            event.registeredCount /
                            event.capacity
                          ) * 100,
                          100
                        )
                      : 0;


                  return (

                    <div
                      key={
                        event.id
                      }
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >

                      <div className="flex items-start justify-between mb-3">

                        <div className="flex-1 min-w-0">

                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {
                              event.title
                            }
                          </h3>

                          <p className="text-xs text-gray-500 mt-0.5">
                            {
                              event.organizer
                            }
                            {' • '}
                            {
                              event.category
                            }
                          </p>

                        </div>


                        <Badge
                          variant={
                            getStatusVariant(
                              event.status
                            ) as any
                          }
                          dot
                        >
                          {
                            event.status
                          }
                        </Badge>

                      </div>


                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {
                          event.description ||
                          'No description available.'
                        }
                      </p>


                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">

                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {
                            event.date
                          }
                        </span>


                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {
                            event.time
                          }
                          {' - '}
                          {
                            event.endTime
                          }
                        </span>


                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {
                            event.location
                          }
                        </span>


                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {
                            event.registeredCount
                          }
                          /
                          {
                            event.capacity
                          }
                        </span>

                      </div>


                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">

                        <div
                          className="bg-indigo-600 rounded-full h-1.5"
                          style={{
                            width:
                              `${percentage}%`,
                          }}
                        />

                      </div>


                      <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            openDetails(
                              event
                            )
                          }
                          className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />

                          View
                        </button>


                        {
                          event.status ===
                            'Upcoming' &&
                          !isRegistered &&
                          event.availableSeats >
                            0 && (
                            <button
                              onClick={() =>
                                handleRegister(
                                  event.id
                                )
                              }
                              className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 flex items-center gap-1"
                            >
                              <UserPlus className="h-3 w-3" />

                              Register
                            </button>
                          )
                        }


                        {
                          isRegistered && (
                            <button
                              onClick={() =>
                                handleUnregister(
                                  event.id
                                )
                              }
                              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-1"
                            >
                              <UserMinus className="h-3 w-3" />

                              Cancel
                            </button>
                          )
                        }


                        {
                          event.availableSeats <=
                            0 &&
                          !isRegistered &&
                          event.status ===
                            'Upcoming' && (
                            <span className="text-xs text-red-600 font-medium">
                              Full
                            </span>
                          )
                        }

                      </div>

                    </div>
                  );
                }
              )

            )}

          </div>


          {totalPages > 1 && (
            <Pagination
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              onPageChange={
                setCurrentPage
              }
            />
          )}

        </>
      )}


      {/* ======================================================
          EVENT DETAILS
          ====================================================== */}

      <Modal
        isOpen={
          !!showDetail
        }
        onClose={() =>
          setShowDetail(null)
        }
        title={
          showDetail?.title ||
          'Event Details'
        }
        size="lg"
      >

        {showDetail && (

          <div className="space-y-5">

            <div>

              <p className="text-sm text-gray-600">
                {
                  showDetail.description ||
                  'No description available.'
                }
              </p>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-gray-500">
                  Organizer
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {
                    showDetail.organizer
                  }
                </p>
              </div>


              <div>
                <p className="text-xs text-gray-500">
                  Category
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {
                    showDetail.category
                  }
                </p>
              </div>


              <div>
                <p className="text-xs text-gray-500">
                  Date
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {
                    showDetail.date
                  }
                </p>
              </div>


              <div>
                <p className="text-xs text-gray-500">
                  Time
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {
                    showDetail.time
                  }
                  {' - '}
                  {
                    showDetail.endTime
                  }
                </p>
              </div>


              <div>
                <p className="text-xs text-gray-500">
                  Location
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {
                    showDetail.location
                  }
                </p>
              </div>


              <div>
                <p className="text-xs text-gray-500">
                  Capacity
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {
                    showDetail.registeredCount
                  }
                  /
                  {
                    showDetail.capacity
                  }

                  <span className="text-gray-500 font-normal">
                    {' '}
                    (
                    {
                      showDetail.availableSeats
                    }
                    {' '}
                    available)
                  </span>
                </p>
              </div>

            </div>


            {canManage &&
              showDetail.registrantNames &&
              showDetail.registrantNames.length >
                0 && (

              <div>

                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Registered Attendees (
                  {
                    showDetail.registrantNames.length
                  }
                  )
                </h4>


                <div className="space-y-2 max-h-56 overflow-y-auto">

                  {showDetail.registrantNames.map(
                    (
                      registrant
                    ) => {

                      const initials =
                        registrant.name
                          .split(' ')
                          .filter(Boolean)
                          .map(
                            (part) =>
                              part[0]
                          )
                          .join('')
                          .substring(
                            0,
                            2
                          )
                          .toUpperCase();


                      return (

                        <div
                          key={
                            registrant.employeeId
                          }
                          className="flex items-center gap-3 py-2 border-b border-gray-100"
                        >

                          <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">
                            {
                              initials
                            }
                          </div>


                          <div>

                            <p className="text-sm text-gray-900">
                              {
                                registrant.name
                              }
                            </p>

                            <p className="text-xs text-gray-500">
                              {
                                registrant.department ||
                                '-'
                              }
                            </p>

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              </div>
            )}


            {canManage &&
              (
                showDetail.registrantNames?.length ||
                0
              ) === 0 && (

              <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-500">
                No employees have registered for this event yet.
              </div>

            )}


            {!isManagementView &&
              user &&
              showDetail.status ===
                'Upcoming' && (

              <div className="flex justify-end">

                {showDetail.registeredIds?.includes(
                  user.employeeId
                ) ? (

                  <button
                    onClick={() => {
                      handleUnregister(
                        showDetail.id
                      );

                      setShowDetail(
                        null
                      );
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-2"
                  >
                    <UserMinus className="h-4 w-4" />

                    Cancel Registration
                  </button>

                ) : showDetail.availableSeats >
                  0 ? (

                  <button
                    onClick={() => {
                      handleRegister(
                        showDetail.id
                      );

                      setShowDetail(
                        null
                      );
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />

                    Register for Event
                  </button>

                ) : (

                  <span className="text-sm font-medium text-red-600">
                    This event is full.
                  </span>

                )}

              </div>
            )}

          </div>
        )}

      </Modal>


      {/* ======================================================
          CREATE / EDIT EVENT
          ====================================================== */}

      <Modal
        isOpen={
          showForm
        }
        onClose={() => {
          if (!saving) {
            setShowForm(
              false
            );
          }
        }}
        title={
          editingEvent
            ? 'Edit Event'
            : 'Create Event'
        }
        size="lg"
      >

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >

          <FormInput
            label="Event Title"
            required
            value={
              form.title
            }
            onChange={(event) =>
              setForm({
                ...form,
                title:
                  event.target.value,
              })
            }
            error={
              errors.title
            }
          />


          <FormTextarea
            label="Description"
            value={
              form.description
            }
            onChange={(event) =>
              setForm({
                ...form,
                description:
                  event.target.value,
              })
            }
            rows={3}
            placeholder="Describe the event..."
          />


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <FormInput
              label="Organizer Employee ID"
              required
              value={
                form.organizerId
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  organizerId:
                    event.target.value,
                })
              }
              error={
                errors.organizerId
              }
              placeholder="EMP001"
            />


            <FormSelect
              label="Category"
              required
              value={
                form.category
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  category:
                    event.target.value,
                })
              }
              options={
                EVENT_CATEGORIES.map(
                  (category) => ({
                    value:
                      category,
                    label:
                      category,
                  })
                )
              }
            />


            <FormInput
              label="Date"
              type="date"
              required
              value={
                form.date
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  date:
                    event.target.value,
                })
              }
              error={
                errors.date
              }
            />


            <FormInput
              label="Start Time"
              type="time"
              required
              value={
                form.time
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  time:
                    event.target.value,
                })
              }
              error={
                errors.time
              }
            />


            <FormInput
              label="End Time"
              type="time"
              required
              value={
                form.endTime
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  endTime:
                    event.target.value,
                })
              }
              error={
                errors.endTime
              }
            />


            <FormInput
              label="Location"
              required
              value={
                form.location
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  location:
                    event.target.value,
                })
              }
              error={
                errors.location
              }
              placeholder="Conference Room A"
            />


            <FormInput
              label="Capacity"
              type="number"
              required
              min="1"
              value={
                form.capacity
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  capacity:
                    event.target.value,
                })
              }
              error={
                errors.capacity
              }
            />


            <FormSelect
              label="Status"
              required
              value={
                form.status
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  status:
                    event.target.value,
                })
              }
              options={[
                {
                  value:
                    'Upcoming',
                  label:
                    'Upcoming',
                },
                {
                  value:
                    'Ongoing',
                  label:
                    'Ongoing',
                },
                {
                  value:
                    'Completed',
                  label:
                    'Completed',
                },
                {
                  value:
                    'Cancelled',
                  label:
                    'Cancelled',
                },
              ]}
            />

          </div>


          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              disabled={
                saving
              }
              onClick={() =>
                setShowForm(
                  false
                )
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                saving
              }
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >

              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {
                editingEvent
                  ? 'Update Event'
                  : 'Create Event'
              }

            </button>

          </div>

        </form>

      </Modal>


      {/* ======================================================
          DELETE CONFIRMATION
          ====================================================== */}

      <ConfirmDialog
        isOpen={
          deleteId !== null
        }
        onClose={() =>
          setDeleteId(null)
        }
        onConfirm={
          handleDelete
        }
        title="Delete Event"
        message="Are you sure you want to delete this event? All employee registrations for this event will also be removed."
        confirmLabel="Delete Event"
        variant="danger"
        isLoading={
          deleting
        }
      />

    </div>
  );
}