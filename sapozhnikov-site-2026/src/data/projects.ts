// Single source of truth for the projects menu and routes.
// Keep this list short and obvious — each project has its own page file.

export type Project = {
  slug: string;
  title: string;
  href: string;
  /** Optional subtitle / years shown next to the title. */
  hint?: string;
};

export const projects: Project[] = [
  { slug: "retro", title: "New Tretyakov Gallery", href: "/retro/", hint: "Retrospective 2003-2018" },
  { slug: "a-wonderful-day", title: "A Wonderful Day", href: "/a_wonderful_day/" },
  { slug: "dance", title: "Dance", href: "/dance/" },
  { slug: "senza-titolo", title: "Senza Titolo", href: "/senza_titolo/" },
  { slug: "the-city", title: "The City", href: "/the_city/" },
  { slug: "the-drama-machine", title: "The Drama Machine", href: "/the_drama_machine/" },
  { slug: "total-picture", title: "Total Picture", href: "/total_picture/" },
  { slug: "untitled", title: "Untitled", href: "/untitled/" },
  { slug: "photos-2010", title: "2010", href: "/2010_photos/" },
  { slug: "photos-2003-2011", title: "2003-2012", href: "/2003-2011/" },
];

export type InfoLink = {
  slug: string;
  title: string;
  href: string;
};

export const infoLinks: InfoLink[] = [
  { slug: "about", title: "About", href: "/about/" },
  { slug: "books", title: "Books", href: "/books/" },
  { slug: "links", title: "Links", href: "/links/" },
  { slug: "contacts", title: "Contact", href: "/contacts/" },
];
