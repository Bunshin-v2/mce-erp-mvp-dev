(function () {
  const setInitialTheme = () => {
    const savedConfig = localStorage.getItem('mce-style-config');
    let theme = 'system'; // Default theme

    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        if (parsedConfig.theme) {
          theme = parsedConfig.theme;
        }
      } catch (e) {
        console.error("Failed to parse mce-style-config from localStorage", e);
      }
    }

    if (theme === 'system') {
      document.documentElement.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      document.documentElement.dataset.theme = theme;
    }
  };

  setInitialTheme();
})();
