// Nothing OS Design System
export const theme = {
  colors: {
    // Core Colors
    black: '#000000',
    deepGray: '#1C1C1C', 
    mediumGray: '#333333',
    lightGray: '#666666',
    offWhite: '#F5F5F5',
    white: '#FFFFFF',
    
    // Nothing Signature
    nothingRed: '#FF0000',
    
    // Semantic Colors
    success: '#00FF00',
    warning: '#FFFF00',
    error: '#FF0000',
    
    // UI Mappings
    background: '#000000',
    surface: '#1C1C1C',
    card: '#333333',
    border: '#333333',
    text: '#FFFFFF',
    textSecondary: '#666666',
    accent: '#FF0000',
  },
  
  typography: {
    fontFamily: {
      mono: "NType82Mono-Regular",
      system: "NType82-Regular",
      heading:"LetteraMonoLLCondLight-Regular.otf"
    },
    fontSize: {
      xs: 12,
      s: 14,
      m: 16,
      l: 18,
      xl: 24
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '700'
    }
  },
  
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48
  },
  
  layout: {
    borderRadius: 0, // Sharp corners only
    borderWidth: 1,
    gridUnit: 8 // 8px base grid
  }
};

// Nothing-specific component styles
export const nothingStyles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
    padding: theme.spacing.m,
  },
  
  screenTitle: {
    fontFamily: theme.typography.fontFamily.system,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.nothingRed,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.l,
  },
  
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    borderBottomWidth: theme.layout.borderWidth,
    borderBottomColor: theme.colors.border,
  },
  
  taskText: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.m,
    color: theme.colors.white,
    flex: 1,
    marginLeft: theme.spacing.s,
  },
  
  button: {
    backgroundColor: 'transparent',
    borderWidth: theme.layout.borderWidth,
    borderColor: theme.colors.white,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    alignItems: 'center',
    marginVertical: theme.spacing.s,
  },
  
  buttonText: {
    fontFamily: theme.typography.fontFamily.heading,
    fontSize: theme.typography.fontSize.m,
    color: theme.colors.white,
    textTransform: 'uppercase',
  },
  
  priorityDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  }
};