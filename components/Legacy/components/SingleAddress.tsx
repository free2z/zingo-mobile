/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Platform, ScrollView } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-simple-toast';
import ClickableText from './Components/ClickableText';
import FadeText from './Components/FadeText';
import Button from './Button';
import Utils from '../app/utils';
import { useTheme } from '@react-navigation/native';

type SingleAddressProps = {
  address: string;
  addressKind: string;
  index: number;
  total: number;
  prev: () => void;
  next: () => void;
};

const SingleAddress: React.FunctionComponent<SingleAddressProps> = ({
  address,
  addressKind,
  index,
  total,
  prev,
  next,
}) => {
  // console.log(`Addresses ${addresses}: ${multipleAddresses}`);
  const { colors } = useTheme();

  const multi = total > 1;

  // 30 characters per line
  const numLines = addressKind === 't' ? 2 : address.length / 30;
  const chunks = Utils.splitStringIntoChunks(address, numLines.toFixed(0));
  const fixedWidthFont = Platform.OS === 'android' ? 'monospace' : 'Courier';

  const doCopy = () => {
    if (address) {
      Clipboard.setString(address);
      Toast.show('Copied Address to Clipboard', Toast.LONG);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        {
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: colors.background,
        },
      ]}
      keyboardShouldPersistTaps="handled">
      <View style={{ marginTop: 20, padding: 10, backgroundColor: colors.border }}>
        <QRCode value={address} size={200} ecl="L" backgroundColor={colors.border} />
      </View>
      <ClickableText style={{ marginTop: 15 }} onPress={doCopy}>
        Tap To Copy
      </ClickableText>

      <View
        style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, justifyContent: 'center' }}>
        {chunks.map(c => (
          <FadeText
            key={c}
            style={{
              flexBasis: '100%',
              textAlign: 'center',
              fontFamily: fixedWidthFont,
              fontSize: 18,
              color: colors.text,
            }}>
            {c}
          </FadeText>
        ))}
      </View>

      {multi && (
        <View style={{ display: 'flex', flexDirection: 'row', marginTop: 10, alignItems: 'center', marginBottom: 100 }}>
          <Button type="Secondary" title={'Prev'} style={{ width: '25%', margin: 10 }} onPress={prev} />
          <FadeText>
            {index + 1} of {total}
          </FadeText>
          <Button type="Secondary" title={'Next'} style={{ width: '25%', margin: 10 }} onPress={next} />
        </View>
      )}
    </ScrollView>
  );
};

export default SingleAddress;
