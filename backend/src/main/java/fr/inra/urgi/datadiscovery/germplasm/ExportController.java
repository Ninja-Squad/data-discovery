package fr.inra.urgi.datadiscovery.germplasm;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.AppAggregation;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.dao.faidare.FaidareAggregation;
import fr.inra.urgi.datadiscovery.dao.faidare.FaidareDocumentDao;
import fr.inra.urgi.datadiscovery.exception.BadRequestException;
import fr.inra.urgi.datadiscovery.germplasm.api.ExportFormat;
import fr.inra.urgi.datadiscovery.germplasm.api.FaidareApiService;
import fr.inra.urgi.datadiscovery.germplasm.api.GermplasmExportCommand;
import fr.inra.urgi.datadiscovery.germplasm.api.GermplasmMcpdExportCommand;
import fr.inra.urgi.datadiscovery.germplasm.api.GermplasmMiappeExportCommand;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import reactor.core.publisher.Flux;

/**
 * A controller used only for the Faidare application, used to export germplasm results
 * @author JB Nizet
 */
@Profile({AppProfile.FAIDARE})
@RestController
@RequestMapping("/api/germplasms")
public class ExportController {

    private static final String GERMPLASM_ENTRY_TYPE = "Germplasm";

    private final FaidareDocumentDao documentDao;
    private final AggregationAnalyzer aggregationAnalyzer;
    private final FaidareApiService faidareApiService;

    public ExportController(FaidareDocumentDao documentDao,
                            AggregationAnalyzer aggregationAnalyzer,
                            FaidareApiService faidareApiService) {
        this.documentDao = documentDao;
        this.aggregationAnalyzer = aggregationAnalyzer;
        this.faidareApiService = faidareApiService;
    }

    /**
     * Searches for the given query and export the results by delegating to the Faidare application.
     * This can only be called with parameters leading to only germplasm results, i.e. the parameters must have
     * the document type aggregation with germplasm as the only value. If not, an error is thrown
     * @param query the query
     * @param parameters all the parameters, containing the refinements based on the aggregations. The names
     * of the other parameters are the names of the aggregations, and the values are one of the values for that
     * aggregation.
     *
     * @see AppAggregation
     */
    @GetMapping("/exports/mcpd")
    public ResponseEntity<StreamingResponseBody> exportGermplasmMcpds(
            @RequestParam(value = "query", defaultValue = "") String query,
            @RequestParam("descendants") Optional<Boolean> descendants,
            @RequestParam MultiValueMap<String, String> parameters) {
        Set<String> germplasmIds = findGermplasmIds(query, descendants, parameters);

        GermplasmMcpdExportCommand command = new GermplasmMcpdExportCommand(germplasmIds, Collections.emptyList());
        Flux<DataBuffer> result = faidareApiService.exportMcpd(command);
        StreamingResponseBody body = outputStream -> DataBufferUtils.write(result, outputStream).blockLast();
        return ResponseEntity.ok().contentType(ExportFormat.CSV.getMediaType()).body(body);
    }

    /**
     * Searches for the given query and export the results by delegating to the Faidare application.
     * This can only be called with parameters leading to only germplasm results, i.e. the parameters must have
     * the document type aggregation with germplasm as the only value. If not, an error is thrown
     * @param query the query
     * @param parameters all the parameters, containing the refinements based on the aggregations. The names
     * of the other parameters are the names of the aggregations, and the values are one of the values for that
     * aggregation.
     *
     * @see AppAggregation
     */
    @GetMapping("/exports/plant-material")
    public ResponseEntity<StreamingResponseBody> exportGermplasmPlantMaterial(
            @RequestParam(value = "query", defaultValue = "") String query,
            @RequestParam("descendants") Optional<Boolean> descendants,
            @RequestParam MultiValueMap<String, String> parameters) {
        Set<String> germplasmIds = findGermplasmIds(query, descendants, parameters);

        GermplasmExportCommand command = new GermplasmExportCommand(germplasmIds, Collections.emptyList());
        Flux<DataBuffer> result = faidareApiService.exportPlantMaterial(command);
        StreamingResponseBody body = outputStream -> DataBufferUtils.write(result, outputStream).blockLast();
        return ResponseEntity.ok().contentType(ExportFormat.CSV.getMediaType()).body(body);
    }

    /**
     * Searches for the given query and export the results by delegating to the Faidare application,
     * using the MIAPPE (Excel) format
     * This can only be called with parameters leading to only germplasm results, i.e. the parameters must have
     * the document type aggregation with germplasm as the only value. If not, an error is thrown
     * @param query the query
     * @param format the format of the export
     * @param parameters all the parameters, containing the refinements based on the aggregations. The names
     * of the other parameters are the names of the aggregations, and the values are one of the values for that
     * aggregation.
     *
     * @see AppAggregation
     */
    @GetMapping("/exports/miappe")
    public ResponseEntity<StreamingResponseBody> exportGermplasmMiappe(
        @RequestParam(value = "query", defaultValue = "") String query,
        @RequestParam("descendants") Optional<Boolean> descendants,
        @RequestParam(value = "format", defaultValue = "EXCEL") ExportFormat format,
        @RequestParam MultiValueMap<String, String> parameters) {
        Set<String> germplasmIds = findGermplasmIds(query, descendants, parameters);

        GermplasmMiappeExportCommand command = new GermplasmMiappeExportCommand(germplasmIds, format);
        Flux<DataBuffer> result = faidareApiService.exportMiappe(command);
        StreamingResponseBody body = outputStream -> DataBufferUtils.write(result, outputStream).blockLast();
        return ResponseEntity.ok().contentType(format.getMediaType()).body(body);
    }

    private Set<String> findGermplasmIds(String query,
                                         Optional<Boolean> descendants,
                                         MultiValueMap<String, String> parameters) {
        SearchRefinements refinements = createRefinementsFromParameters(parameters);
        checkGermplasmOnlyEntryType(refinements);

        return documentDao.findAllIds(
            query,
            descendants.orElse(false),
            refinements,
            "germplasmDbId"
        );
    }

    private SearchRefinements createRefinementsFromParameters(MultiValueMap<String, String> parameters) {
        SearchRefinements.Builder builder = SearchRefinements.builder();
        for (AppAggregation appAggregation : aggregationAnalyzer.getAggregations()) {
            List<String> parameterValues = parameters.get(appAggregation.getName());
            if (parameterValues != null && !parameterValues.isEmpty()) {
                builder.withTerm(appAggregation, parameterValues);
            }
        }

        return builder.build();
    }

    private void checkGermplasmOnlyEntryType(SearchRefinements refinements) {
        Set<String> entryTypeAggregationValues = refinements.getRefinementsForTerm(FaidareAggregation.ENTRY_TYPE);
        if (!Objects.equals(entryTypeAggregationValues, Collections.singleton(GERMPLASM_ENTRY_TYPE))) {
            throw new BadRequestException("The entry aggregation must be present and have " + GERMPLASM_ENTRY_TYPE + " as its unique value");
        }
    }
}
