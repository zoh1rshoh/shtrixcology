import { JOURNEY_TIMELINE_DAYS } from '@shtrixcology/shared';

export interface JourneyNotification {
  day: number;
  title: string;
  body: string;
}

export const JOURNEY_MESSAGES: Record<number, { title: string; body: string }> = {
  1: { title: '📦 Qabul qilindi', body: 'Qadoqingiz punktga qabul qilindi. Sayohat boshlandi.' },
  2: { title: '🔍 Saralanmoqda', body: 'Material bo\'yicha ajratilmoqda.' },
  4: { title: '💧 Yuvilmoqda', body: 'Isrof: 0.3L suv. Oddiy usulda 3L ketardi.' },
  6: { title: '⚙️ Maydalanmoqda', body: 'Kichik bo\'laklarga aylantirilmoqda.' },
  8: { title: '🔥 Eritilmoqda', body: '260°C issiqlik. Qayta tug\'ilish yaqin.' },
  10: { title: '💭 Bir narsa yasalmoqda', body: 'Hali sir. 2 kun qoldi.' },
  11: { title: '🎁 Tayyor', body: 'Ertaga ochiladi. Uxla yaxshi.' },
  12: { title: '🎉 Qayta tug\'ildi!', body: 'Qadoqingiz yangi hayotga ega bo\'ldi. Ochib ko\'ring!' },
};

export function getJourneyMessages(): JourneyNotification[] {
  return JOURNEY_TIMELINE_DAYS
    .map((day) => {
      const msg = JOURNEY_MESSAGES[day];
      if (!msg) return null;
      return { day, title: msg.title, body: msg.body };
    })
    .filter((n): n is JourneyNotification => n !== null);
}