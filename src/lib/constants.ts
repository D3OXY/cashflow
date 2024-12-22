export const SPACE_ICONS = [
    { value: "💰", label: "Money" },
    { value: "🏠", label: "Home" },
    { value: "💼", label: "Work" },
    { value: "🎓", label: "Education" },
    { value: "🏢", label: "Business" },
    { value: "🛒", label: "Shopping" },
    { value: "✈️", label: "Travel" },
    { value: "🎮", label: "Entertainment" },
    { value: "🏋️", label: "Fitness" },
    { value: "🎨", label: "Art" },
    { value: "🌟", label: "Personal" },
    { value: "🔧", label: "Tools" },
] as const;

export type SpaceIcon = (typeof SPACE_ICONS)[number]["value"];

export const PROFILE_IMAGES = [
    {
        id: "1",
        url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        label: "Avatar 1",
    },
    {
        id: "2",
        url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
        label: "Avatar 2",
    },
    {
        id: "3",
        url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
        label: "Avatar 3",
    },
    {
        id: "4",
        url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
        label: "Avatar 4",
    },
    {
        id: "5",
        url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
        label: "Avatar 5",
    },
    {
        id: "6",
        url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily",
        label: "Avatar 6",
    },
    {
        id: "7",
        url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
        label: "Avatar 7",
    },
    {
        id: "8",
        url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
        label: "Avatar 8",
    },
] as const;
