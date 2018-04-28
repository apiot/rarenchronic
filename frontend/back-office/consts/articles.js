const ARTICLE_STATUS = {
    UNSAVED: 'unsaved',
    DRAFT: 'draft',
    PUBLISHED: 'published',
    UNPUBLISHED: 'unpublished',
};

const ARTICLE_STATUS_LABELS = {
    [ARTICLE_STATUS.UNSAVED]: 'Non sauvegardé',
    [ARTICLE_STATUS.DRAFT]: 'Brouillon',
    [ARTICLE_STATUS.PUBLISHED]: 'Publié',
    [ARTICLE_STATUS.UNPUBLISHED]: 'Non publié',
};

const ARTICLE_PUBLIC = {
    PUBLIC: 'public',
    NOT_PUBLIC: 'notPublic',
};

const ARTICLE_PUBLIC_LABELS = {
    [ARTICLE_PUBLIC.PUBLIC]: 'Publique',
    [ARTICLE_PUBLIC.NOT_PUBLIC]: 'Non publique',
};

const COMMENTS_STATUS = {
    OPENED: 'opened',
    CLOSED: 'closed',
};

const COMMENTS_STATUS_LABELS = {
    [COMMENTS_STATUS.OPENED]: 'Ouverts',
    [COMMENTS_STATUS.CLOSED]: 'Fermés'
};

export {
    ARTICLE_STATUS,
    ARTICLE_STATUS_LABELS,
    ARTICLE_PUBLIC,
    ARTICLE_PUBLIC_LABELS,
    COMMENTS_STATUS,
    COMMENTS_STATUS_LABELS,
};
