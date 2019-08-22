export const isElementOutOfVisibleScreen = (
  element: HTMLElement,
  window: Window
) => {
  const { top, height } = element.getBoundingClientRect();
  const safetyMargin = 20;
  return (
    top + height - safetyMargin < 0 || top + safetyMargin > window.innerHeight
  );
};
