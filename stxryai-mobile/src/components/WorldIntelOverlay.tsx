import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { MobileNarrativeContext } from '../services/narrativeService';

interface WorldIntelOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  context: MobileNarrativeContext | null;
}

const { width, height } = Dimensions.get('window');

export const WorldIntelOverlay: React.FC<WorldIntelOverlayProps> = ({ isVisible, onClose, context }) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>World Intel</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Characters */}
            <Section title="Characters" icon="people">
              {context?.characters.length ? (
                context.characters.map((char, index) => (
                  <View key={char.id || index} style={styles.card}>
                    <Text style={styles.cardTitle}>{char.name}</Text>
                    <Text style={styles.cardText}>{char.description || 'No description available.'}</Text>
                    {char.status && <Text style={styles.badge}>{char.status}</Text>}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No characters discovered yet.</Text>
              )}
            </Section>

            {/* World Elements / Locations */}
            <Section title="Locations & Lore" icon="map">
              {context?.worldElements.length ? (
                context.worldElements.map((el, index) => (
                  <View key={el.id || index} style={styles.card}>
                    <Text style={styles.cardTitle}>{el.name}</Text>
                    <Text style={styles.cardText}>{el.description || 'Ancient and mysterious.'}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>The world is still unfolding.</Text>
              )}
            </Section>

            {/* Active Ripples */}
            <Section title="World Ripples" icon="water">
              {context?.activeRipples.length ? (
                context.activeRipples.map((ripple, index) => (
                  <View key={ripple.id || index} style={[styles.card, styles.rippleCard]}>
                    <Text style={styles.cardTitle}>{ripple.title || 'Consequence'}</Text>
                    <Text style={styles.cardText}>{ripple.description}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No major ripples active.</Text>
              )}
            </Section>
          </ScrollView>
        </BlurView>
      </View>
    </Modal>
  );
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={20} color="#00ffd5" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Sora-Bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#00ffd5',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rippleCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#ff00ff',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,255,213,0.1)',
    color: '#00ffd5',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});
