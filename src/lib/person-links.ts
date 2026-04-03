export interface LinkedPerson {
  id: string;
  name: string;
  phone?: string | null;
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

const normalizeArabicDigits = (value: string) =>
  value.replace(/[٠-٩]/g, (digit) => ARABIC_DIGITS.indexOf(digit).toString());

export const normalizePersonName = (name: string) =>
  name.trim().replace(/\s+/g, " ");

const normalizePhone = (phone?: string | null) =>
  normalizeArabicDigits(phone ?? "").replace(/\D+/g, "");

const pushToMap = (map: Map<string, string[]>, key: string, value: string) => {
  const current = map.get(key) || [];
  current.push(value);
  map.set(key, current);
};

export const buildLinkedPersonMap = <T extends LinkedPerson>(
  visiblePeople: T[],
  allPeople: LinkedPerson[],
) => {
  const visibleIdsByPhone = new Map<string, string[]>();
  const visibleIdsByName = new Map<string, string[]>();

  visiblePeople.forEach((person) => {
    const normalizedPhone = normalizePhone(person.phone);
    const normalizedName = normalizePersonName(person.name);

    if (normalizedPhone) {
      pushToMap(visibleIdsByPhone, normalizedPhone, person.id);
    }

    if (normalizedName) {
      pushToMap(visibleIdsByName, normalizedName, person.id);
    }
  });

  const linkedIds = new Set<string>();
  const aliasToVisibleId = new Map<string, string>();

  allPeople.forEach((person) => {
    const normalizedPhone = normalizePhone(person.phone);
    const normalizedName = normalizePersonName(person.name);

    const phoneMatches = normalizedPhone ? visibleIdsByPhone.get(normalizedPhone) || [] : [];
    const nameMatches = normalizedName ? visibleIdsByName.get(normalizedName) || [] : [];
    const matchedVisibleIds = phoneMatches.length > 0 ? phoneMatches : nameMatches;

    if (matchedVisibleIds.length === 0) return;

    linkedIds.add(person.id);
    aliasToVisibleId.set(
      person.id,
      matchedVisibleIds.find((visibleId) => visibleId === person.id) || matchedVisibleIds[0],
    );
  });

  visiblePeople.forEach((person) => {
    linkedIds.add(person.id);
    aliasToVisibleId.set(person.id, person.id);
  });

  return {
    linkedIds: Array.from(linkedIds),
    aliasToVisibleId,
  };
};