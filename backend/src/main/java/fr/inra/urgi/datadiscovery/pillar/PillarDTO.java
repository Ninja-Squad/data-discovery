package fr.inra.urgi.datadiscovery.pillar;

import java.util.List;
import java.util.Objects;

import fr.inra.urgi.datadiscovery.util.Utils;

/**
 * A pillar, with its list of database sources
 * @author JB Nizet
 */
public final class PillarDTO {
    /**
     * The name of the pillar
     */
    private final String name;

    /**
     * The database sources of this pillar
     */
    private final List<DatabaseSourceDTO> databaseSources;

    public PillarDTO(String name, List<DatabaseSourceDTO> databaseSources) {
        this.name = name;
        this.databaseSources = Utils.nullSafeUnmodifiableCopy(databaseSources);
    }

    public String getName() {
        return name;
    }

    public List<DatabaseSourceDTO> getDatabaseSources() {
        return databaseSources;
    }

    /**
     * Returns the number of documents in this pillar. We could use the docCount retrieved by Elasticsearch,
     * but since these counts are approximate, just summing the counts from database resources avoids
     * wondering why the sum of the database sources document count is not equal to the pillar document count.
     */
    public long getDocumentCount() {
        return this.databaseSources.stream().mapToLong(DatabaseSourceDTO::getDocumentCount).sum();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        PillarDTO pillarDTO = (PillarDTO) o;
        return Objects.equals(name, pillarDTO.name) &&
            Objects.equals(databaseSources, pillarDTO.databaseSources);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, databaseSources);
    }

    @Override
    public String toString() {
        return "PillarDTO{" +
            "name='" + name + '\'' +
            ", databaseSources=" + databaseSources +
            '}';
    }
}
