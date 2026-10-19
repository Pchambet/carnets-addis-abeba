export const ACCESS_KEY = 'carnets_access';

/** Pas de code d'accès si NEXT_PUBLIC_SITE_UNLOCKED=1 */
export const HAS_GATE = process.env.NEXT_PUBLIC_SITE_UNLOCKED !== '1';

/**
 * Lu dans <head> avant le premier affichage (layout.tsx) : si le code a déjà été saisi,
 * <html data-access="open"> montre le contenu, sinon le CSS montre le formulaire.
 * Le contenu est donc rendu par le serveur, sans écran « Chargement… ».
 */
export const ACCESS_SCRIPT = `try{if(sessionStorage.getItem('${ACCESS_KEY}')==='1')document.documentElement.dataset.access='open'}catch(e){}`;
