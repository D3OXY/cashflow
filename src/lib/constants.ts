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
