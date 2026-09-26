

export type Reply = {
    from: 'Super Admin' | 'Instructor';
    message: string;
    date: string;
    isRead: boolean;
};

export type School = {
    id: string;
    name: string;
    ownerId: string;
    subscriptionTier: 'pdi' | 'solo' | 'school' | 'academy' | 'enterprise';
    subscriptionStatus: 'trial' | 'active' | 'free' | 'cancelled';
    trialEndDate?: string;
}

export const subscriptionTierPrices: Record<School['subscriptionTier'], number> = {
    'pdi': 0,
    'solo': 10,
    'school': 25,
    'academy': 100,
    'enterprise': 400 // Example price
};


export type PricingTier = {
    id: string;
    label: string;
    price: number;
}

export type CarDetails = {
    make: string;
    model: string;
    transmission: 'Manual' | 'Automatic';
    fuelType: string;
    colour: string;
    registration: string;
}

export type Address = {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
}

export type InstructorSettings = {
    pricing: PricingTier[];
    rules: {
        minLessonDurationMinutes: 60;
    };
    carDetails: CarDetails;
    holidayMode: {
        enabled: boolean;
        startDate: string | null;
        endDate: string | null;
    },
    notifications: {
        email: boolean;
        push: boolean;
    }
}

export type Instructor = {
    id: string;
    schoolId: string;
    name: string;
    email: string;
    phone: string;
    address?: Address;
    registrationNumber: string;
    accountType: 'PDI' | 'ADI';
    status: 'pending' | 'approved' | 'denied';
    subscriptionTier?: School['subscriptionTier'];
    subscriptionStatus?: 'trial' | 'active' | 'free' | 'cancelled';
    trialEndDate?: string;
    settings: InstructorSettings;
}

export type TestAttempt = {
  date: string | null;
  status: 'Not Booked' | 'Booked' | 'Passed' | 'Failed';
  location?: string | null;
  certificateNumber?: string | null;
};

export type Pupil = {
  id: string;
  instructorId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  avatarUrl?: string;
  address: Address;
  licenceNumber: string;
  theoryTest: TestAttempt[];
  practicalTest: TestAttempt[];
  progress: {
    manoeuvres: number;
    junctions: number;
    roundabouts: number;
    dualCarriageway: number;
    independentDriving: number;
  };
};

export type Lesson = {
  id: string;
  pupilId: string;
  instructorId: string;
  title: string;
  date: string;
  status?: 'booked' | 'provisional' | 'completed' | 'no-show';
  notes?: string;
};

export type LessonPlan = {
  lessonId: string;
  plan: string;
}

export function saveLessonPlan(lessonId: string, plan: string) {
    const existingPlanIndex = lessonPlans.findIndex(p => p.lessonId === lessonId);
    if (existingPlanIndex !== -1) {
        lessonPlans[existingPlanIndex].plan = plan;
    } else {
        lessonPlans.push({ lessonId, plan });
    }
}

export type LessonFeedback = {
  lessonId: string;
  pupilId: string;
  workedWell: string;
  struggledWith: string;
  doMoreOf: string;
  generalFeedback?: string;
}

export type TrainingAid = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  youtubeUrl?: string;
};

export type BookingRequest = {
    id: string;
    pupilId: string;
    instructorId: string;
    requestedSlots: string[];
    status: 'pending' | 'approved' | 'declined';
}

export type SignupRequest = {
    id: string;
    schoolName: string;
    ownerName: string;
    email: string;
    phone: string;
    registrationNumber: string;
    accountType: 'PDI' | 'ADI';
    address: Address;
    status: 'pending' | 'denied' | 'approved';
    date: string;
}

export type AppIssue = {
    id: string;
    schoolId: string;
    reportedBy: string; // Could be instructor ID or name
    title: string;
    description: string;
    status: 'open' | 'in-progress' | 'closed';
    priority: 'low' | 'medium' | 'high';
}

export type LandingPageFeature = {
    title: string;
    description: string;
    icon: 'Bot' | 'Calendar' | 'Users' | 'BarChart' | 'Shield' | 'Rocket' | 'HelpCircle';
};

export type LandingPageTestimonial = {
    quote: string;
    author: string;
    school: string;
};

export type FaqItem = {
    question: string;
    answer: string;
};

export type FaqCategory = {
    id: string;
    title: string;
    items: FaqItem[];
};

export type ContactSubmission = {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    date: string;
    isRead: boolean;
    replies?: Reply[];
    category: 'General' | 'Bug Report' | 'Feature Request' | 'Account Help';
};


// MOCK DATA //

export let schools: School[] = [
    { id: 'school-driveswift', name: 'DriveSwift Academy', ownerId: 'instructor-driveswift-alex', subscriptionTier: 'school', subscriptionStatus: 'active' },
    { id: 'school-citylearners', name: 'City Learners', ownerId: 'instructor-citylearners-mike', subscriptionTier: 'solo', subscriptionStatus: 'trial' },
    { id: 'school-elite', name: 'Elite Driving Academy', ownerId: 'instructor-elite', subscriptionTier: 'school', subscriptionStatus: 'active' },
];

export let instructors: Instructor[] = [
    { 
        id: 'instructor-driveswift-alex', 
        schoolId: 'school-driveswift', 
        name: 'Alex Johnson', 
        email: 'instructor@driveswift.com',
        phone: '07123456789',
        registrationNumber: '123456', 
        accountType: 'ADI',
        status: 'approved',
        settings: {
            pricing: [
                { id: 'p1', label: 'Single Hour', price: 35 },
                { id: 'p2', label: '10 Hour Block', price: 330 },
            ],
            rules: { minLessonDurationMinutes: 60 },
            carDetails: { make: "Ford", model: "Focus", transmission: "Manual", fuelType: "Petrol", colour: "Blue", registration: "AB21 CDE" },
            holidayMode: { enabled: false, startDate: null, endDate: null },
            notifications: { email: true, push: true }
        }
    },
    { 
        id: 'instructor-driveswift-emily', 
        schoolId: 'school-driveswift', 
        name: 'Emily White', 
        email: 'emily.w@driveswift.com',
        phone: '07987654321',
        registrationNumber: '654321',
        accountType: 'ADI',
        status: 'approved',
        settings: {
            pricing: [
                { id: 'p3', label: '1 Hour Lesson', price: 38 },
                { id: 'p4', label: '90 Minute Lesson', price: 55 },
            ],
            rules: { minLessonDurationMinutes: 60 },
            carDetails: { make: "Vauxhall", model: "Corsa", transmission: "Automatic", fuelType: "Electric", colour: "Red", registration: "CD22 EFG" },
            holidayMode: { enabled: true, startDate: new Date().toISOString(), endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString() },
            notifications: { email: true, push: false }
        }
    },
    { 
        id: 'instructor-citylearners-mike', 
        schoolId: 'school-citylearners', 
        name: 'Mike Ross', 
        email: 'mike.r@citylearners.co.uk',
        phone: '07112233445',
        registrationNumber: 'P98765',
        accountType: 'PDI',
        status: 'approved',
        settings: {
            pricing: [
                { id: 'p5', label: '1 Hour (PDI Rate)', price: 28 },
            ],
            rules: { minLessonDurationMinutes: 60 },
            carDetails: { make: "Peugeot", model: "208", transmission: "Manual", fuelType: "Petrol", colour: "Yellow", registration: "EF23 GHI" },
            holidayMode: { enabled: false, startDate: null, endDate: null },
            notifications: { email: false, push: true }
        }
    },
    { 
        id: 'instructor-elite', 
        schoolId: 'school-elite', 
        name: 'Chris Rogers', 
        email: 'chris.r@elitedriving.com',
        phone: '07555666777',
        registrationNumber: '778899', 
        accountType: 'ADI',
        status: 'approved',
        settings: {
            pricing: [
                { id: 'p6', label: 'Single Hour', price: 40 },
                { id: 'p7', label: '10 Hour Block', price: 380 },
            ],
            rules: { minLessonDurationMinutes: 60 },
            carDetails: { make: "BMW", model: "1 Series", transmission: "Manual", fuelType: "Diesel", colour: "Black", registration: "XY23 ZAB" },
            holidayMode: { enabled: false, startDate: null, endDate: null },
            notifications: { email: true, push: true }
        }
    },
];

export let pupils: Pupil[] = [
  {
    id: 'pupil-ben',
    instructorId: 'instructor-driveswift-alex',
    name: 'Ben Stokes',
    email: 'ben.stokes@example.com',
    phone: '07123123123',
    avatar: 'BS',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    address: { line1: '123 Cricket Lane', city: 'Durham', postcode: 'DH1 1AA' },
    licenceNumber: 'STOKE123456BS9AB',
    theoryTest: [{ status: 'Passed', date: '2023-08-15T00:00:00.000Z', certificateNumber: '123456789' }],
    practicalTest: [{ status: 'Booked', date: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(), location: 'Durham Test Centre' }],
    progress: { manoeuvres: 80, junctions: 70, roundabouts: 75, dualCarriageway: 60, independentDriving: 65 }
  },
  {
    id: 'pupil-chloe',
    instructorId: 'instructor-driveswift-emily',
    name: 'Chloe Kelly',
    email: 'chloe.kelly@example.com',
    phone: '07456456456',
    avatar: 'CK',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    address: { line1: '456 Football Drive', city: 'Manchester', postcode: 'M1 1BB' },
    licenceNumber: 'KELLY456789CK9CD',
    theoryTest: [{ status: 'Booked', date: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString() }],
    practicalTest: [{ status: 'Not Booked', date: null }],
    progress: { manoeuvres: 40, junctions: 50, roundabouts: 45, dualCarriageway: 20, independentDriving: 30 }
  },
  {
    id: 'pupil-alice',
    instructorId: 'instructor-driveswift-alex',
    name: 'Alice Walker',
    email: 'alice.walker@example.com',
    phone: '07789789789',
    avatar: 'AW',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    address: { line1: '789 Novel Avenue', city: 'London', postcode: 'SE1 9FG' },
    licenceNumber: 'WALKE789012AW9EF',
    theoryTest: [{ status: 'Not Booked', date: null }],
    practicalTest: [{ status: 'Not Booked', date: null }],
    progress: { manoeuvres: 20, junctions: 30, roundabouts: 25, dualCarriageway: 10, independentDriving: 15 }
  }
];

export let lessons: Lesson[] = [
  // Ben's lessons (Pupil 1, Instructor 1)
  { id: 'lesson-1', pupilId: 'pupil-ben', instructorId: 'instructor-driveswift-alex', title: 'Motorway Driving', date: '2024-05-10T10:00:00.000Z', status: 'completed', notes: 'Good lane discipline. Needs to improve observation on slip roads.' },
  { id: 'lesson-2', pupilId: 'pupil-ben', instructorId: 'instructor-driveswift-alex', title: 'Mock Test', date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), status: 'booked' },
  // Chloe's lessons (Pupil 2, Instructor 2)
  { id: 'lesson-3', pupilId: 'pupil-chloe', instructorId: 'instructor-driveswift-emily', title: 'Introduction to Roundabouts', date: '2024-05-12T14:00:00.000Z', status: 'completed' },
  { id: 'lesson-4', pupilId: 'pupil-chloe', instructorId: 'instructor-driveswift-emily', title: 'Bay Parking', date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), status: 'booked' },
  { id: 'lesson-5', pupilId: 'pupil-chloe', instructorId: 'instructor-driveswift-emily', title: 'Blocked Time', date: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString() },
];

export let lessonPlans: LessonPlan[] = [
    {
        lessonId: 'lesson-2',
        plan: `
Objective: Simulate a real driving test to identify areas for improvement.

1.  **5 mins:** Eyesight check and "Show Me, Tell Me" questions.
2.  **20 mins:** Independent driving section following sat nav.
3.  **10 mins:** Perform one of the three reverse manoeuvres (randomly chosen).
4.  **10 mins:** General driving on varied roads, including dual carriageways.
5.  **5 mins:** Debrief, go over any faults, and create a plan for the final few lessons.`
    },
];

export let lessonFeedback: LessonFeedback[] = [
    {
        lessonId: 'lesson-1',
        pupilId: 'pupil-ben',
        workedWell: "Felt confident at 70mph and changing lanes.",
        struggledWith: "Joining the motorway from the slip road is still a bit scary.",
        doMoreOf: "Maybe one more motorway lesson before my test?",
        generalFeedback: "Great lesson!"
    },
];

export const trainingAids: TrainingAid[] = [
  {
    id: 'ta1',
    title: 'Road Signs Handbook',
    description: 'A comprehensive guide to all UK road signs for the theory test.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    category: 'Theory',
    youtubeUrl: 'https://www.youtube.com/watch?v=__60i2A3pTs'
  },
  {
    id: 'ta2',
    title: 'Parallel Park Masterclass',
    description: 'Video tutorial demonstrating the perfect parallel park manoeuvre.',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    category: 'Manoeuvres',
    youtubeUrl: 'https://www.youtube.com/watch?v=L4x28-i3A6M',
  },
  {
    id: 'ta3',
    title: 'Hazard Perception Clips',
    description: 'Practice clips to improve your hazard perception skills.',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
    category: 'Theory',
    youtubeUrl: 'https://www.youtube.com/watch?v=J6e1G93Kq2w'
  },
  {
    id: 'ta4',
    title: 'Show Me, Tell Me Questions',
    description: 'A complete list of all official "Show Me, Tell Me" questions.',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    category: 'Practical Test',
    youtubeUrl: 'https://www.youtube.com/watch?v=ubOIkY_kF-E'
  },
];

const now = new Date();
export const bookingRequests: BookingRequest[] = [
    { id: 'br1', pupilId: 'pupil-alice', instructorId: 'instructor-driveswift-alex', requestedSlots: [new Date(now.setDate(now.getDate() + 8)).toISOString()], status: 'pending' }
];

export const appIssues: AppIssue[] = [];

export const contactSubmissions: ContactSubmission[] = [
    { id: 'cs-1', name: 'John Doe', email: 'instructor@driveswift.com', subject: 'Question about Enterprise plan', message: 'Hi, I was wondering what the pricing structure is for the Enterprise plan for a franchise of over 100 instructors. Thanks.', date: new Date().toISOString(), isRead: false, replies: [], category: 'Account Help' },
    { id: 'cs-2', name: 'Aisha Khan', email: 'a.khan@safestart.co.uk', subject: 'Account Approval Status', message: 'Hello, I signed up a few days ago and my account is still pending approval. Could you please let me know when it might be reviewed? My school name is Safe Start Drivers. Thanks, Aisha', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), isRead: false, replies: [], category: 'Account Help' },
    { id: 'cs-3', name: 'Tech Support', email: 'support@competitor.com', subject: 'Bug Report', message: 'Found a minor CSS issue on your pricing page on mobile. The popular badge overlaps the card title on screens smaller than 320px.', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), isRead: true, replies: [ { from: 'Super Admin', message: 'Thanks for the heads up, we will get that fixed!', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), isRead: true } ], category: 'Bug Report' },
    { id: 'cs-4', name: 'Mike Ross', email: 'mike.r@citylearners.co.uk', subject: 'Feature Request: Holiday Mode', message: 'It would be great to have a "holiday mode" to block out a whole week at once in the calendar.', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), isRead: true, replies: [ { from: 'Super Admin', message: 'Great suggestion, Mike. We\'ll add it to our roadmap!', date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), isRead: true } ], category: 'Feature Request' },
];

export let signupRequests: SignupRequest[] = [
    { id: 'req-1', schoolName: 'Mersey Driving School', ownerName: 'Peter Jones', email: 'peter.j@merseydriving.com', phone: '07123456789', registrationNumber: '123456', accountType: 'ADI', address: { line1: '10 Mersey Way', city: 'Liverpool', postcode: 'L1 0AA' }, status: 'pending', date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()},
    { id: 'req-2', schoolName: 'Safe Start Drivers', ownerName: 'Aisha Khan', email: 'a.khan@safestart.co.uk', phone: '07987654321', registrationNumber: 'P654321', accountType: 'PDI', address: { line1: '25 Safe Street', city: 'London', postcode: 'E1 6AN' }, status: 'pending', date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()},
];

export let deniedSignupRequests: SignupRequest[] = [];

export let landingPageFeatures: LandingPageFeature[] = [
    { icon: 'Bot', title: 'AI-Powered Lesson Planner', description: 'Generate personalized lesson plans in seconds, tailored to each student\'s skill level and learning pace.', },
    { icon: 'Calendar', title: 'Smart Diary Management', description: 'Manage your availability, schedule lessons, and avoid double bookings with an intuitive calendar designed for instructors.', },
    { icon: 'Users', title: 'Comprehensive Pupil Records', description: 'Maintain detailed records of your students, including contact information, progress, and lesson history, all in one place.', },
    { icon: 'BarChart', title: 'Intuitive Progress Tracking', description: 'Visually track pupil development across key driving skills, helping you and your students focus on areas that need improvement.', },
    { icon: 'Rocket', title: 'Pupil Progress App', description: 'Empower your students with their own portal to view progress, see upcoming lessons, and access training aids.', },
    { icon: 'Shield', title: 'Multi-School Platform', description: 'Built for scale, DriveSwift can manage multiple driving schools under one umbrella, with powerful admin oversight tools.', },
];

export let landingPageTestimonials: LandingPageTestimonial[] = [
    { quote: "The AI lesson planner is a game-changer. I save at least an hour a day on admin. More time for teaching!", author: "Sarah J.", school: "Accelerate Driving School" },
    { quote: "My pupils love the progress tracking app. It keeps them motivated and they can see exactly where they need to improve.", author: "Mike P.", school: "CityDrive Go" },
    { quote: "Switching to DriveSwift was the best decision for my school. The diary management is flawless and has completely eliminated booking errors.", author: "Fatima K.", school: "LearnSafe Driving" },
    { quote: "As a PDI, the free tier was a lifesaver. It helped me manage my first few pupils professionally without any upfront cost.", author: "David L.", school: "PDI in Training" },
    { quote: "The automated reminders for lessons have reduced my no-shows by over 80%. My revenue is up and my schedule is reliable.", author: "Emily R.", school: "First-Time Pass" },
    { quote: "I manage three instructors and DriveSwift's team calendar gives me a perfect overview of the whole school at a glance.", author: "Tom H.", school: "Apex Driving Academy" },
];

export const faqCategories: FaqCategory[] = [
    {
        id: 'cat-1',
        title: "For Instructors",
        items: [
            { question: "Is my data secure?", answer: "Yes, we use industry-standard encryption and security practices to protect all your data and your pupils' information." },
            { question: "Can I use this on multiple devices?", answer: "Absolutely. DriveSwift is a web-based platform, so you can access it on any phone, tablet, or computer with an internet connection." },
            { question: "How does the AI lesson planner work?", answer: "Our AI uses information about the student's progress and your lesson objectives to suggest a structured, effective plan. You can then edit and customize it to your liking." }
        ]
    },
    {
        id: 'cat-2',
        title: "For Pupils",
        items: [
            { question: "How do I book a lesson?", answer: "You can book lessons through the dedicated Pupil App. Just log in, view your instructor's availability, and request a slot." },
            { question: "Can my parents see my progress?", answer: "Yes, with your permission, you can grant access to a parent or guardian so they can see your progress and upcoming lesson schedule." }
        ]
    }
];

export const instructorSettings: InstructorSettings = instructors[0].settings;
