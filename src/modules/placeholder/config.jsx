// A reserved slot for the next control-testing module. It renders on the
// menu with the same card style as any working module, but is marked
// comingSoon so it can't be opened yet - swap this out for a real config
// (with welcome/validationChecks/dashboard/excel, same shape as
// reconciliation's) once the next module is built.
export const placeholderModule = {
  id: "placeholder-next",
  menu: {
    title: "New Control Module",
    tagline: "Another control-testing assistant - coming soon",
    badge: "Coming Soon",
    accent: "#94a3b8",
  },
  comingSoon: true,
};
