/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActiveTab = 'home' | 'materi' | 'game' | 'kuis' | 'tujuan' | 'profil';

export interface StoryChunk {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  character: {
    name: string;
    avatar: string;
    phrase: string;
    role: string;
  };
  graphicType: 'barter_simple' | 'barter_mismatch' | 'money_intro' | 'money_features';
  miniQuestion: {
    q: string;
    opts: string[];
    ansIdx: number;
    explanation: string;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
  category: 'Barter' | 'Nilai Uang' | 'Syarat Uang' | 'Pelaku Ekonomi';
  iconName: string;
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  color: string;
}

export interface GameLevel {
  id: number;
  customerName: string;
  customerAvatar: string;
  boughtItem: StoreItem;
  quantity: number;
  cashGiven: number;
  correctChange: number;
  hint: string;
}
