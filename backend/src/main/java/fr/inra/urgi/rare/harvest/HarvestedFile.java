package fr.inra.urgi.rare.harvest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * The information about a harvested file
 * @author JB Nizet
 */
public final class HarvestedFile {

    /**
     * The name of the file that has been harvested
     */
    private final String fileName;

    /**
     * The number of genetic resources in the file that have been successfully stored in ElesticSearch
     */
    private final int successCount;

    /**
     * The number of errors that have occurred while harvesting the file
     */
    private final int errorCount;

    /**
     * The errors that have occurred while harvesting the file
     */
    private final List<HarvestedFileError> errors;

    private HarvestedFile(HarvestedFileBuilder builder) {
        this(builder.fileName, builder.successCount, builder.errorCount, builder.errors);
    }

    @JsonCreator
    public HarvestedFile(String fileName,
                         int successCount,
                         int errorCount,
                         List<HarvestedFileError> errors) {
        this.fileName = fileName;
        this.successCount = successCount;
        this.errorCount = errorCount;
        this.errors = Collections.unmodifiableList(new ArrayList<>(errors));
    }

    public String getFileName() {
        return fileName;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public int getErrorCount() {
        return errorCount;
    }

    public List<HarvestedFileError> getErrors() {
        return errors;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        HarvestedFile that = (HarvestedFile) o;
        return successCount == that.successCount &&
            errorCount == that.errorCount &&
            Objects.equals(fileName, that.fileName) &&
            Objects.equals(errors, that.errors);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fileName, successCount, errorCount, errors);
    }

    @Override
    public String toString() {
        return "HarvestedFile{" +
            "fileName='" + fileName + '\'' +
            ", successCount=" + successCount +
            ", errorCount=" + errorCount +
            ", errors=" + errors +
            '}';
    }

    /**
     * Creates a mutable builder allowing to record what happens while harvesting a file, and finally to build
     * a HarvestedFile instance.
     * @param fileName the name of the file being harvested
     */
    public static HarvestedFileBuilder builder(String fileName) {
        return new HarvestedFileBuilder(fileName);
    }

    /**
     * A mutable builder allowing to record what happens while harvesting a file, and finally to build
     * a HarvestedFile instance.
     */
    public static final class HarvestedFileBuilder {
        private final String fileName;
        private int successCount;
        private int errorCount;
        private final List<HarvestedFileError> errors = new ArrayList<>();

        private HarvestedFileBuilder(String fileName) {
            this.fileName = fileName;
        }

        /**
         * Adds a success, i.e. records a success for one of the genetic resources stored in the file
         */
        public HarvestedFileBuilder addSuccess() {
            this.successCount++;
            return this;
        }

        /**
         * Adds N successes, i.e. records a success for N of the genetic resources stored in the file
         */
        public HarvestedFileBuilder addSuccesses(int count) {
            this.successCount += count;
            return this;
        }

        /**
         * Adds an error, i.e. records an error for one of the genetic resources stored in the file
         * @param index the index of the genetic resource for which the error happened
         * @param error the message of the error
         */
        public HarvestedFileBuilder  addError(int index, String error, int line, int column) {
            this.errorCount++;
            errors.add(new HarvestedFileError(index, error, line, column));
            return this;
        }

        /**
         * Builds a HarvestedFile containing the successes and errors currently recorded in this builder.
         */
        public HarvestedFile build() {
            return new HarvestedFile(this);
        }
    }

}
