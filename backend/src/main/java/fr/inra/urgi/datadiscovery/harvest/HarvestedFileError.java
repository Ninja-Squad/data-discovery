package fr.inra.urgi.datadiscovery.harvest;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * An error that happened while harvesting a file
 * @author JB Nizet
 */
public final class HarvestedFileError {
    /**
     * The index of the document that triggered the error, inside the array of documents contained in
     * the file.
     */
    private final int index;

    /**
     * The message of the error
     */
    private final String error;
    private final int line;
    private final int column;

    @JsonCreator
    public HarvestedFileError(int index,
                              String error,
                              int line,
                              int column) {
        this.index = index;
        this.error = error;
        this.line = line;
        this.column = column;
    }

    public int getIndex() {
        return index;
    }

    public String getError() {
        return error;
    }

    public int getLine() {
        return line;
    }

    public int getColumn() {
        return column;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        HarvestedFileError that = (HarvestedFileError) o;
        return index == that.index &&
            line == that.line &&
            column == that.column &&
            Objects.equals(error, that.error);
    }

    @Override
    public int hashCode() {
        return Objects.hash(index, error, line, column);
    }

    @Override
    public String toString() {
        return "HarvestedFileError{" +
            "index=" + index +
            ", error='" + error + '\'' +
            ", line=" + line +
            ", column=" + column +
            '}';
    }
}
