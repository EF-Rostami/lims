import type { Locale } from "./types";
export { SUPPORTED_LOCALES, LOCALE_NAMES, isLocale } from "./types";
export type { Locale };

import en from "./messages/en.json";
import fr from "./messages/fr.json";
import de from "./messages/de.json";
import es from "./messages/es.json";
import it from "./messages/it.json";
import nl from "./messages/nl.json";
import pl from "./messages/pl.json";

export const DICTS: Record<Locale, typeof en> = { en, fr, de, es, it, nl, pl };
