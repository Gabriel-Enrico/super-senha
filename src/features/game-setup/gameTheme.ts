import { StyleSheet } from 'react-native';

export const ink = {
  background: '#0b0b0d',
  panel: '#18181b',
  line: '#424247',
  white: '#f7f6f3',
  text: '#eeedeb',
  muted: '#b2b0b1',
  dim: '#929095',
};

export const gameStyles = StyleSheet.create({
  section: { gap: 10 },
  stack: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  grow: { flex: 1, minWidth: 0 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  panel: { borderWidth: 1, borderColor: ink.line, backgroundColor: ink.panel, padding: 14, gap: 8 },
  input: {
    minHeight: 48, borderWidth: 1, borderColor: ink.line, backgroundColor: ink.panel,
    color: ink.text, paddingHorizontal: 12, fontSize: 16, fontFamily: 'Pixelify',
  },
  choice: {
    minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: ink.line, backgroundColor: ink.panel, padding: 10,
  },
  selected: { borderColor: ink.white },
  focus: { borderColor: ink.white, borderWidth: 2 },
});
