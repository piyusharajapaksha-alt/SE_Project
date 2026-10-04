import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  LogIn,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useAuth,
} from '@/contexts/AuthContext';

export default function LandingPage() {

  const steps = [
    {
      number: '01',
      icon: Building2,
      title: 'Create your company',
      description: 'Register your company and owner account.',
    },
    {
      number: '02',
      icon: Users,
      title: 'Build your team',
      description: 'Add employees and assign their roles.',
    },
    {
      number: '03',
      icon: ShieldCheck,
      title: 'Secure access',
      description: 'Each person gets their own login account.',
    },
    {
      number: '04',
      icon: BarChart3,
      title: 'Manage everything',
      description: 'Use one workspace for everyday staff management.',
    },
  ];

  const navigate =
    useNavigate();

  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const firstName =
    profile?.firstName ||
    user?.email?.split('@')[0] ||
    'there';

  const continuePath =
    user?.accountType === 'OWNER'
      ? '/owner'
      : '/dashboard';

  if (isLoading) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="flex flex-col items-center gap-3">

          <div className="
            w-9 h-9
            border-2
            border-indigo-600
            border-t-transparent
            rounded-full
            animate-spin
          " />

          <p className="text-sm text-gray-500">
            Loading StaffHub...
          </p>

        </div>

      </div>
    );
  }

  const features = [
    {
      icon: Clock3,
      title: 'Smart Attendance',
      description:
        'Track employee attendance and make daily workforce monitoring easier.',
    },
    {
      icon: CalendarDays,
      title: 'Leave Management',
      description:
        'Submit, review and manage employee leave from one workspace.',
    },
    {
      icon: TrendingUp,
      title: 'Performance',
      description:
        'Keep monthly performance reviews organized and accessible.',
    },
    {
      icon: GraduationCap,
      title: 'Training',
      description:
        'Manage learning opportunities and employee development.',
    },
    {
      icon: CalendarDays,
      title: 'Events',
      description:
        'Organize company events and keep employees connected.',
    },
    {
      icon: MessageSquareWarning,
      title: 'Grievances',
      description:
        'Give employees a structured way to raise workplace concerns.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <header className="
        sticky top-0 z-50
        border-b border-gray-100
        bg-white/90 backdrop-blur-xl
      ">

        <div className="
          max-w-7xl mx-auto
          px-5 sm:px-6 lg:px-8
          h-16
          flex items-center justify-between
        ">

          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
            className="flex items-center gap-3"
          >

            <div className="
              w-10 h-10
              rounded-xl
              bg-indigo-600
              text-white
              flex items-center justify-center
              shadow-lg shadow-indigo-200
            ">
              <span className="font-bold">
                SH
              </span>
            </div>

            <div className="text-left">

              <div className="font-bold text-lg leading-tight">
                StaffHub
              </div>

              <div className="text-[11px] text-gray-500">
                Staff Management System
              </div>

            </div>

          </button>


          <nav className="
            hidden md:flex
            items-center gap-7
            text-sm
            text-gray-600
          ">

            <a
              href="#features"
              className="hover:text-indigo-600 transition-colors"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="hover:text-indigo-600 transition-colors"
            >
              How it works
            </a>

            <a
              href="#about"
              className="hover:text-indigo-600 transition-colors"
            >
              About StaffHub
            </a>

          </nav>


          <div className="flex items-center gap-2">

            {isAuthenticated ? (

              <button
                onClick={() =>
                  navigate(continuePath)
                }
                className="
                  inline-flex items-center gap-2
                  rounded-lg
                  bg-indigo-600
                  px-4 py-2.5
                  text-sm font-semibold
                  text-white
                  shadow-sm
                  hover:bg-indigo-700
                  transition-all
                "
              >

                <span className="hidden sm:inline">
                  Continue to StaffHub
                </span>

                <span className="sm:hidden">
                  Continue
                </span>

                <ArrowRight className="w-4 h-4" />

              </button>

            ) : (

              <>
                <button
                  onClick={() =>
                    navigate('/login')
                  }
                  className="
                    hidden sm:inline-flex
                    items-center gap-2
                    px-3 py-2
                    text-sm font-medium
                    text-gray-700
                    hover:text-indigo-600
                  "
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </button>

                <button
                  onClick={() =>
                    navigate('/register')
                  }
                  className="
                    inline-flex items-center gap-2
                    rounded-lg
                    bg-indigo-600
                    px-4 py-2.5
                    text-sm font-semibold
                    text-white
                    hover:bg-indigo-700
                    shadow-sm
                    transition-all
                  "
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Get started
                  </span>
                  <span className="sm:hidden">
                    Sign up
                  </span>
                </button>
              </>
            )}

          </div>

        </div>

      </header>


      {/* =====================================================
          HERO
          ===================================================== */}

      <main>

        <section className="
          relative
          overflow-hidden
          bg-gray-50
          border-b border-gray-100
        ">

          {/* Animated background shapes */}

          <div className="
            absolute
            -top-32
            -right-32
            w-96 h-96
            rounded-full
            bg-indigo-200/40
            blur-3xl
            animate-pulse
          " />

          <div className="
            absolute
            top-1/2
            -left-32
            w-72 h-72
            rounded-full
            bg-blue-100/60
            blur-3xl
          " />


          <div className="
            relative
            max-w-7xl mx-auto
            px-5 sm:px-6 lg:px-8
            py-20 lg:py-28
          ">

            <div className="
              grid
              lg:grid-cols-2
              gap-14
              items-center
            ">

              {/* LEFT */}

              <div>

                {isAuthenticated ? (

                  <div className="
                    inline-flex items-center gap-2
                    px-3 py-1.5
                    rounded-full
                    bg-green-50
                    border border-green-200
                    text-green-700
                    text-xs font-semibold
                    mb-6
                  ">

                    <CheckCircle2 className="w-4 h-4" />

                    You're already signed in

                  </div>

                ) : (

                  <div className="
                    inline-flex items-center gap-2
                    px-3 py-1.5
                    rounded-full
                    bg-indigo-50
                    border border-indigo-100
                    text-indigo-700
                    text-xs font-semibold
                    mb-6
                  ">

                    <Sparkles className="w-4 h-4" />

                    One workspace for your people

                  </div>

                )}


                <h1 className="
                  text-4xl
                  sm:text-5xl
                  lg:text-6xl
                  font-bold
                  tracking-tight
                  leading-[1.08]
                  text-gray-950
                ">

                  Manage your team.

                  <span className="
                    block
                    text-indigo-600
                    mt-2
                  ">
                    Better with StaffHub.
                  </span>

                </h1>


                <p className="
                  mt-6
                  max-w-xl
                  text-base sm:text-lg
                  leading-8
                  text-gray-600
                ">

                  StaffHub brings attendance, leave,
                  performance, training, events,
                  grievances and employee management
                  together in one simple workspace.

                </p>


                {isAuthenticated ? (

                  <div className="
                    mt-8
                    rounded-2xl
                    border border-green-200
                    bg-white
                    p-5
                    shadow-lg
                    shadow-gray-200/50
                    max-w-xl
                  ">

                    <div className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    ">

                      <div>

                        <p className="
                          text-xs
                          text-gray-500
                          mb-1
                        ">
                          Welcome back
                        </p>

                        <h2 className="
                          text-lg
                          font-bold
                          text-gray-900
                        ">
                          {firstName} 👋
                        </h2>

                        <p className="
                          text-sm
                          text-gray-500
                          mt-1
                        ">
                          {user?.email}
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          navigate(continuePath)
                        }
                        className="
                          shrink-0
                          inline-flex
                          items-center
                          gap-2
                          px-4 py-2.5
                          rounded-lg
                          bg-indigo-600
                          text-white
                          text-sm
                          font-semibold
                          hover:bg-indigo-700
                          transition
                        "
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </button>

                    </div>

                  </div>

                ) : (

                  <div className="
                    mt-8
                    flex flex-col
                    sm:flex-row
                    gap-3
                  ">

                    <button
                      onClick={() =>
                        navigate('/register')
                      }
                      className="
                        group
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-6 py-3.5
                        rounded-xl
                        bg-indigo-600
                        text-white
                        font-semibold
                        shadow-lg
                        shadow-indigo-200
                        hover:bg-indigo-700
                        hover:-translate-y-0.5
                        transition-all
                      "
                    >

                      Create your company

                      <ArrowRight
                        className="
                          w-4 h-4
                          group-hover:translate-x-1
                          transition-transform
                        "
                      />

                    </button>


                    <button
                      onClick={() =>
                        navigate('/login')
                      }
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-6 py-3.5
                        rounded-xl
                        bg-white
                        border border-gray-200
                        text-gray-700
                        font-semibold
                        hover:border-indigo-200
                        hover:bg-indigo-50
                        transition
                      "
                    >

                      <LogIn className="w-4 h-4" />

                      Sign in

                    </button>

                  </div>

                )}


                <div className="
                  mt-7
                  flex flex-wrap
                  items-center
                  gap-x-6 gap-y-3
                  text-xs
                  text-gray-500
                ">

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Secure authentication
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Built for teams
                  </div>

                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    Centralized management
                  </div>

                </div>

              </div>


              {/* RIGHT - DASHBOARD PREVIEW */}

              <div className="relative">

                <div className="
                  absolute
                  inset-0
                  bg-indigo-200/40
                  blur-3xl
                  rounded-full
                  scale-90
                " />


                <div className="
                  relative
                  rounded-3xl
                  border border-gray-200
                  bg-white
                  shadow-2xl
                  shadow-gray-300/50
                  p-4 sm:p-5
                  transform
                  hover:-translate-y-2
                  transition-transform
                  duration-500
                ">

                  <div className="
                    flex items-center
                    justify-between
                    mb-5
                  ">

                    <div className="
                      flex items-center gap-3
                    ">

                      <div className="
                        w-10 h-10
                        rounded-xl
                        bg-indigo-600
                        flex items-center
                        justify-center
                        text-white
                        font-bold
                      ">
                        SH
                      </div>

                      <div>

                        <p className="
                          text-sm
                          font-bold
                          text-gray-900
                        ">
                          StaffHub
                        </p>

                        <p className="
                          text-[11px]
                          text-gray-500
                        ">
                          Management workspace
                        </p>

                      </div>

                    </div>

                    <div className="
                      w-8 h-8
                      rounded-full
                      bg-indigo-50
                      flex items-center
                      justify-center
                    ">
                      <Bell className="
                        w-4 h-4
                        text-indigo-600
                      " />
                    </div>

                  </div>


                  <div className="
                    rounded-2xl
                    bg-gray-50
                    p-4
                    mb-4
                  ">

                    <p className="
                      text-xs
                      text-gray-500
                    ">
                      Today's workspace
                    </p>

                    <p className="
                      text-xl
                      font-bold
                      mt-1
                    ">
                      Everything under control.
                    </p>

                  </div>


                  <div
                    className="
    grid grid-cols-2
    gap-3
  "
                  >
                    {[
                      {
                        icon: Users,
                        title: 'Employees',
                        text: 'Manage your people',
                      },
                      {
                        icon: Clock3,
                        title: 'Attendance',
                        text: 'Track daily attendance',
                      },
                      {
                        icon: TrendingUp,
                        title: 'Performance',
                        text: 'Review progress',
                      },
                      {
                        icon: GraduationCap,
                        title: 'Training',
                        text: 'Develop your team',
                      },
                    ].map(({ icon: Icon, title, text }) => (
                      <div
                        key={title}
                        className="
        bg-white
        border border-gray-100
        rounded-xl
        p-4
        hover:border-indigo-200
        hover:shadow-md
        transition-all
      "
                      >
                        <div
                          className="
          w-9 h-9
          rounded-lg
          bg-indigo-50
          text-indigo-600
          flex items-center
          justify-center
          mb-3
        "
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <p
                          className="
          text-sm
          font-semibold
        "
                        >
                          {title}
                        </p>

                        <p
                          className="
          text-[11px]
          text-gray-500
          mt-1
        "
                        >
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>


                  <div className="
                    mt-4
                    h-2
                    rounded-full
                    bg-gray-100
                    overflow-hidden
                  ">

                    <div className="
                      h-full
                      w-3/4
                      bg-indigo-500
                      rounded-full
                      animate-pulse
                    " />

                  </div>

                </div>


                <div className="
                  absolute
                  -bottom-5
                  -left-5
                  hidden sm:flex
                  items-center gap-3
                  rounded-xl
                  border border-gray-100
                  bg-white
                  shadow-xl
                  px-4 py-3
                  animate-bounce
                ">

                  <CheckCircle2 className="
                    w-5 h-5
                    text-green-500
                  " />

                  <div>

                    <p className="
                      text-xs
                      font-semibold
                    ">
                      Organized
                    </p>

                    <p className="
                      text-[10px]
                      text-gray-500
                    ">
                      Your team workspace
                    </p>

                  </div>

                </div>

              </div>

            </div>


            <div className="
              mt-14
              flex
              justify-center
            ">

              <a
                href="#features"
                className="
                  flex flex-col
                  items-center
                  gap-1
                  text-gray-400
                  hover:text-indigo-600
                  transition
                "
              >

                <span className="text-xs">
                  Explore StaffHub
                </span>

                <ChevronDown className="
                  w-4 h-4
                  animate-bounce
                " />

              </a>

            </div>

          </div>

        </section>


        {/* =====================================================
            FEATURES
            ===================================================== */}

        <section
          id="features"
          className="
            py-20 lg:py-24
            bg-white
          "
        >

          <div className="
            max-w-7xl mx-auto
            px-5 sm:px-6 lg:px-8
          ">

            <div className="
              max-w-2xl
              mx-auto
              text-center
              mb-12
            ">

              <span className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-indigo-600
              ">
                One platform
              </span>

              <h2 className="
                mt-3
                text-3xl sm:text-4xl
                font-bold
                tracking-tight
              ">
                Everything your team needs
              </h2>

              <p className="
                mt-4
                text-gray-500
                leading-7
              ">
                StaffHub connects the everyday processes
                that keep your organization moving.
              </p>

            </div>


            <div className="
              grid
              sm:grid-cols-2
              lg:grid-cols-3
              gap-5
            ">

              {features.map(
                ({
                  icon: Icon,
                  title,
                  description,
                }) => (

                  <div
                    key={title}
                    className="
                      group
                      rounded-2xl
                      border border-gray-100
                      bg-white
                      p-6
                      shadow-sm
                      hover:-translate-y-1
                      hover:border-indigo-100
                      hover:shadow-xl
                      hover:shadow-indigo-100/40
                      transition-all
                      duration-300
                    "
                  >

                    <div className="
                      w-11 h-11
                      rounded-xl
                      bg-indigo-50
                      text-indigo-600
                      flex items-center
                      justify-center
                      mb-5
                      group-hover:bg-indigo-600
                      group-hover:text-white
                      transition-colors
                    ">

                      <Icon className="w-5 h-5" />

                    </div>

                    <h3 className="
                      font-semibold
                      text-gray-900
                    ">
                      {title}
                    </h3>

                    <p className="
                      mt-2
                      text-sm
                      text-gray-500
                      leading-6
                    ">
                      {description}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            WORKFLOW
            ===================================================== */}

        <section
          id="workflow"
          className="
            py-20
            bg-gray-50
            border-y border-gray-100
          "
        >

          <div className="
            max-w-7xl mx-auto
            px-5 sm:px-6 lg:px-8
          ">

            <div className="
              grid
              lg:grid-cols-2
              gap-12
              items-center
            ">

              <div>

                <span className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-indigo-600
                ">
                  Simple workflow
                </span>

                <h2 className="
                  mt-3
                  text-3xl sm:text-4xl
                  font-bold
                ">
                  From company setup to everyday management.
                </h2>

                <p className="
                  mt-4
                  text-gray-500
                  leading-7
                  max-w-xl
                ">
                  Start with your company owner account,
                  set up your team and give every employee
                  the right access.
                </p>

              </div>
              
              <div className="space-y-4">
                {steps.map(({ number, icon: Icon, title, description }) => (
                  <div
                    key={number}
                    className="
        flex gap-4
        bg-white
        rounded-xl
        border border-gray-100
        p-4
        hover:border-indigo-200
        transition
      "
                  >
                    <div
                      className="
          shrink-0
          w-10 h-10
          rounded-lg
          bg-indigo-50
          text-indigo-600
          flex items-center
          justify-center
        "
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="
              text-[10px]
              font-bold
              text-indigo-500
            "
                        >
                          {number}
                        </span>

                        <h3 className="text-sm font-semibold">
                          {title}
                        </h3>
                      </div>

                      <p
                        className="
            mt-1
            text-xs
            text-gray-500
            leading-5
          "
                      >
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>



            </div>

          </div>

        </section>


        {/* =====================================================
            ABOUT
            ===================================================== */}

        <section
          id="about"
          className="
            py-20
            bg-white
          "
        >

          <div className="
            max-w-7xl mx-auto
            px-5 sm:px-6 lg:px-8
          ">

            <div className="
              rounded-3xl
              bg-indigo-600
              text-white
              p-8 sm:p-12 lg:p-16
              relative overflow-hidden
            ">

              <div className="
                absolute
                -right-20
                -top-20
                w-72 h-72
                rounded-full
                bg-white/10
                blur-2xl
              " />

              <div className="
                relative
                max-w-3xl
              ">

                <div className="
                  flex items-center gap-2
                  text-indigo-200
                  text-xs font-bold
                  uppercase tracking-wider
                ">

                  <Sparkles className="w-4 h-4" />

                  About StaffHub

                </div>

                <h2 className="
                  mt-4
                  text-3xl sm:text-4xl
                  font-bold
                ">
                  A single place for your people and your work.
                </h2>

                <p className="
                  mt-5
                  text-indigo-100
                  leading-7
                  max-w-2xl
                ">
                  StaffHub is designed to make staff
                  management easier for companies,
                  managers and employees by bringing
                  essential workforce processes together.
                </p>

                <div
                  className="
    mt-8
    grid
    sm:grid-cols-3
    gap-4
  "
                >
                  {[
                    {
                      icon: ShieldCheck,
                      label: 'Secure',
                    },
                    {
                      icon: Users,
                      label: 'Connected',
                    },
                    {
                      icon: TrendingUp,
                      label: 'Organized',
                    },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="
        rounded-xl
        bg-white/10
        border border-white/10
        p-4
      "
                    >
                      <Icon
                        className="
          w-5 h-5
          text-indigo-200
        "
                      />

                      <p
                        className="
          mt-3
          text-sm
          font-semibold
        "
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            FINAL CTA
            ===================================================== */}

        <section className="
          py-20
          border-t border-gray-100
        ">

          <div className="
            max-w-3xl
            mx-auto
            px-5
            text-center
          ">

            {isAuthenticated ? (

              <>
                <div className="
                  mx-auto
                  w-12 h-12
                  rounded-xl
                  bg-green-50
                  text-green-600
                  flex items-center
                  justify-center
                ">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <h2 className="
                  mt-5
                  text-3xl
                  font-bold
                ">
                  Your StaffHub workspace is ready.
                </h2>

                <p className="
                  mt-3
                  text-gray-500
                ">
                  Continue where you left off.
                </p>

                <button
                  onClick={() =>
                    navigate(continuePath)
                  }
                  className="
                    mt-7
                    inline-flex
                    items-center
                    gap-2
                    px-6 py-3
                    rounded-xl
                    bg-indigo-600
                    text-white
                    font-semibold
                    hover:bg-indigo-700
                    transition
                  "
                >
                  Open StaffHub
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>

            ) : (

              <>
                <h2 className="
                  text-3xl
                  font-bold
                ">
                  Ready to bring your team together?
                </h2>

                <p className="
                  mt-3
                  text-gray-500
                ">
                  Create your company account and start
                  building your StaffHub workspace.
                </p>

                <div className="
                  mt-7
                  flex
                  flex-col sm:flex-row
                  justify-center
                  gap-3
                ">

                  <button
                    onClick={() =>
                      navigate('/register')
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-6 py-3
                      rounded-xl
                      bg-indigo-600
                      text-white
                      font-semibold
                      hover:bg-indigo-700
                      transition
                    "
                  >
                    Create company account
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      navigate('/login')
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-6 py-3
                      rounded-xl
                      border border-gray-200
                      text-gray-700
                      font-semibold
                      hover:bg-gray-50
                      transition
                    "
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </button>

                </div>
              </>
            )}

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="
        border-t border-gray-100
        bg-gray-50
      ">

        <div className="
          max-w-7xl mx-auto
          px-5 sm:px-6 lg:px-8
          py-8
          flex
          flex-col sm:flex-row
          items-center
          justify-between
          gap-4
        ">

          <div className="
            flex items-center gap-3
          ">

            <div className="
              w-8 h-8
              rounded-lg
              bg-indigo-600
              text-white
              flex items-center
              justify-center
              text-xs
              font-bold
            ">
              SH
            </div>

            <div>

              <p className="
                text-sm
                font-semibold
              ">
                StaffHub
              </p>

              <p className="
                text-xs
                text-gray-500
              ">
                Staff Management System
              </p>

            </div>

          </div>

          <p className="
            text-xs
            text-gray-400
          ">
            © {new Date().getFullYear()} StaffHub. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}