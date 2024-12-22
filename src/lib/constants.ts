export const SPACE_ICONS = [
    { label: "Money", value: "💰" },
    { label: "Bank", value: "🏦" },
    { label: "Home", value: "🏠" },
    { label: "Work", value: "💼" },
    { label: "Family", value: "👨‍👩‍👧‍👦" },
    { label: "Personal", value: "👤" },
    { label: "Travel", value: "✈️" },
    { label: "Shopping", value: "🛍️" },
] as const;

export const CATEGORY_ICONS = [
    // Income
    { label: "Salary", value: "💰" },
    { label: "Investment", value: "📈" },
    { label: "Gift", value: "🎁" },
    { label: "Business", value: "💼" },
    { label: "Rental", value: "🏠" },
    { label: "Savings", value: "🏦" },
    { label: "Refund", value: "💸" },
    { label: "Other Income", value: "💵" },

    // Expense
    { label: "Food", value: "🍽️" },
    { label: "Transport", value: "🚗" },
    { label: "Shopping", value: "🛍️" },
    { label: "Bills", value: "📝" },
    { label: "Entertainment", value: "🎮" },
    { label: "Health", value: "🏥" },
    { label: "Education", value: "📚" },
    { label: "Travel", value: "✈️" },
    { label: "Groceries", value: "🛒" },
    { label: "Housing", value: "🏘️" },
    { label: "Insurance", value: "🛡️" },
    { label: "Clothing", value: "👕" },
    { label: "Beauty", value: "💅" },
    { label: "Sports", value: "⚽" },
    { label: "Charity", value: "🤝" },
    { label: "Other", value: "📦" },
] as const;

export const DEFAULT_CATEGORIES = [
    { id: "1", name: "Salary", type: "Income", icon: "💰", color: "#22c55e" },
    { id: "2", name: "Investment", type: "Income", icon: "📈", color: "#10b981" },
    { id: "3", name: "Gift", type: "Income", icon: "🎁", color: "#06b6d4" },
    { id: "4", name: "Food", type: "Expense", icon: "🍽️", color: "#ef4444" },
    { id: "5", name: "Transport", type: "Expense", icon: "🚗", color: "#3b82f6" },
    { id: "6", name: "Shopping", type: "Expense", icon: "🛍️", color: "#f59e0b" },
    { id: "7", name: "Bills", type: "Expense", icon: "📝", color: "#8b5cf6" },
    { id: "8", name: "Entertainment", type: "Expense", icon: "🎮", color: "#ec4899" },
    { id: "9", name: "Health", type: "Expense", icon: "🏥", color: "#06b6d4" },
    { id: "10", name: "Education", type: "Expense", icon: "📚", color: "#6366f1" },
    { id: "11", name: "Travel", type: "Expense", icon: "✈️", color: "#14b8a6" },
    { id: "12", name: "Other", type: "Both", icon: "📦", color: "#6b7280" },
] as const;

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
