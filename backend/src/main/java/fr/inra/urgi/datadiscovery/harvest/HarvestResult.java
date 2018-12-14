package fr.inra.urgi.datadiscovery.harvest;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonCreator;
import fr.inra.urgi.datadiscovery.harvest.HarvestedFile.HarvestedFileBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import static fr.inra.urgi.datadiscovery.util.Utils.nullSafeUnmodifiableCopy;

/**
 * The result of a harvesting operation, stored in ElasticSearch in order to allow diagnosing what happened
 * during the harvesting (which files were harvested, which errors occurred, etc.).
 * @author JB Nizet
 */
@Document(indexName = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}harvest-index",
          type = "#{@dataDiscoveryProperties.getElasticsearchPrefix()}harvest")
public final class HarvestResult {
    @Id
    private final String id;

    @Field(type = FieldType.Date , index = false)
    private final Instant startInstant;

    @Field(type = FieldType.Date , index = false)
    private final Instant endInstant;

    @Field(type = FieldType.Keyword , index = false)
    private final Duration duration;

    @Field(type = FieldType.Keyword , index = false)
    private final List<String> globalErrors;

    @Field(type = FieldType.Object , index = false)
    private final List<HarvestedFile> files;

    private HarvestResult(HarvestResultBuilder builder) {
        this(builder.id,
             builder.startInstant,
             builder.endInstant,
             builder.duration,
             builder.globalErrors,
             builder.files);
    }

    @JsonCreator
    public HarvestResult(String id,
                         Instant startInstant,
                         Instant endInstant,
                         Duration duration,
                         List<String> globalErrors,
                         List<HarvestedFile> files) {
        this.id = id;
        this.startInstant = startInstant;
        this.endInstant = endInstant;
        this.duration = duration;
        this.globalErrors = nullSafeUnmodifiableCopy(globalErrors);
        this.files = nullSafeUnmodifiableCopy(files);
    }

    public String getId() {
        return id;
    }

    public Instant getStartInstant() {
        return startInstant;
    }

    public Instant getEndInstant() {
        return endInstant;
    }

    public Duration getDuration() { return  duration; }

    public List<HarvestedFile> getFiles() {
        return files;
    }

    public List<String> getGlobalErrors() {
        return globalErrors;
    }

    public static HarvestResultBuilder builder() {
        return new HarvestResultBuilder();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        HarvestResult that = (HarvestResult) o;
        return Objects.equals(id, that.id) &&
            Objects.equals(startInstant, that.startInstant) &&
            Objects.equals(endInstant, that.endInstant) &&
            Objects.equals(globalErrors, that.globalErrors) &&
            Objects.equals(files, that.files);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, startInstant, endInstant, globalErrors, files);
    }

    @Override
    public String toString() {
        return "HarvestResult{" +
            "id='" + id + '\'' +
            ", startInstant=" + startInstant +
            ", endInstant=" + endInstant +
            ", globalErrors=" + globalErrors +
            ", files=" + files +
            '}';
    }

    /**
     * A mutable builder allowing to record the operations, and to create an instance of {@link HarvestResult}
     */
    public static final class HarvestResultBuilder {
        private final String id;
        private Instant startInstant;
        private Instant endInstant;
        private Duration duration;
        private final List<HarvestedFile> files = new ArrayList<>();
        private final List<String> globalErrors = new ArrayList<>();

        private HarvestResultBuilder() {
            this.id = UUID.randomUUID().toString();
            this.startInstant = Instant.now();
        }

        /**
         * Sets the start instant (useful in tests)
         */
        public HarvestResultBuilder withStartInstant(Instant startInstant) {
            this.startInstant = startInstant;
            return this;
        }

        /**
         * Adds a global error (i.e. not specific to any given file)
         */
        public HarvestResultBuilder addGlobalError(String error) {
            this.globalErrors.add(error);
            return this;
        }

        /**
         * Starts the harvesting of a file, and returns its {@link HarvestedFileBuilder} allowing to record
         * the successes and errors of the harvesting of that file.
         */
        public HarvestResultBuilder withFile(HarvestedFile harvestedFile) {
            this.files.add(harvestedFile);
            return this;
        }

        /**
         * Builds the {@link HarvestResult} based on the current errors and harvested files in this builder.
         */
        public HarvestResult build() {
            return new HarvestResult(this);
        }

        /**
         * Builds the final {@link HarvestResult} based on the current errors and harvested files in this builder, recording
         * the end instant.
         */
        public HarvestResult end() {
            this.endInstant = Instant.now();
            this.duration = Duration.between(startInstant, endInstant);
            return new HarvestResult(this);
        }
    }
}
