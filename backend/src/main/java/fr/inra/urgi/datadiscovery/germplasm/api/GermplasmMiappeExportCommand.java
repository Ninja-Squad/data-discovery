package fr.inra.urgi.datadiscovery.germplasm.api;

import java.util.Set;

/**
 * Command sent to export a list of germplasm IDs in the MIAPPE format
 * @author JB Nizet
 */
public record GermplasmMiappeExportCommand(
    Set<String> ids,
    ExportFormat format
) {
}
