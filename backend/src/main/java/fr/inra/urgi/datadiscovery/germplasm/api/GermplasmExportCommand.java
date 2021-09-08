package fr.inra.urgi.datadiscovery.germplasm.api;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Command sent to faidare to export germplasms
 * @author JB Nizet
 */
public final class GermplasmExportCommand {
    private final Set<String> ids;

    /**
     * The ordered list of fields to export. If empty, all fields are exported
     */
    private final List<GermplasmExportableField> fields;

    @JsonCreator
    public GermplasmExportCommand(@JsonProperty("ids") Set<String> ids,
                                  @JsonProperty("fields") List<GermplasmExportableField> fields) {
        this.ids = ids;
        this.fields = fields == null ? Collections.emptyList() : fields;
    }

    public Set<String> getIds() {
        return ids;
    }

    public List<GermplasmExportableField> getFields() {
        return fields;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        GermplasmExportCommand that = (GermplasmExportCommand) o;
        return Objects.equals(ids, that.ids) && Objects.equals(fields, that.fields);
    }

    @Override
    public int hashCode() {
        return Objects.hash(ids, fields);
    }

    @Override
    public String toString() {
        return "GermplasmExportCommand{" +
            "ids=" + ids +
            ", fields=" + fields +
            '}';
    }
}
