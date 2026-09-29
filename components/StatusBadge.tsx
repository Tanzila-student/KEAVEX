import { View, Text } from 'react-native';
import { colors } from '../constants/colors';

type Status = 'strong' | 'developing' | 'insufficient';

const map = {
  strong: {
    bg: colors.strongBg,
    text: colors.strong,
    label: 'Strong evidence',
  },

  developing: {
    bg: colors.developingBg,
    text: colors.developing,
    label: 'Developing evidence',
  },

  insufficient: {
    bg: colors.insufficientBg,
    text: colors.insufficient,
    label: 'Insufficient evidence',
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = map[status];

  return (
    <View
      style={{
        backgroundColor: s.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: s.text,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        {s.label}
      </Text>
    </View>
  );
}