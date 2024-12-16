export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat(undefined, {
      ...defaultOptions,
      ...options,
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const diffInDays = Math.floor(diffInSeconds / (60 * 60 * 24));

  if (diffInDays > 0) {
    return `Due in ${diffInDays} day${diffInDays === 1 ? "" : "s"}`;
  } else if (diffInDays === 0) {
    return "Due today";
  } else {
    return `${Math.abs(diffInDays)} day${
      Math.abs(diffInDays) === 1 ? "" : "s"
    } overdue`;
  }
}
