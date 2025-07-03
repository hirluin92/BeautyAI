// 📁 lib/quantum-theme.ts
export const quantumTheme = {
  colors: {
    neural: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      accent: '#0f3460',
      surface: '#162447',
    },
    quantum: {
      purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)',
      pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
      green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #667eea 100%)',
      gold: 'linear-gradient(135deg, #f6d365 0%, #fda085 50%, #fd746c 100%)',
    },
    effects: {
      neuralGlow: '0 0 30px rgba(0, 212, 255, 0.5)',
      quantumShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      glassBackground: 'rgba(255, 255, 255, 0.03)',
      glassBorder: 'rgba(255, 255, 255, 0.08)',
    }
  },
  animations: {
    quantumPulse: 'animate-pulse',
    neuralScan: 'animate-pulse',
    hologramFloat: 'animate-bounce',
  }
} 