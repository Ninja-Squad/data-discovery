package fr.inra.urgi.datadiscovery.ontology.api;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * A link, part of an {@link Ontology}
 * @author JB Nizet
 */
public final class Link {
    private final String href;
    private final String rel;

    @JsonCreator
    public Link(String href, String rel) {
        this.href = href;
        this.rel = rel;
    }

    public String getHref() {
        return href;
    }

    public String getRel() {
        return rel;
    }

    @Override
    public String toString() {
        return "Link{" +
            "href='" + href + '\'' +
            ", rel='" + rel + '\'' +
            '}';
    }
}
